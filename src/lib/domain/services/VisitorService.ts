import { IVisitorService } from "@/lib/domain/interfaces/IVisitorService";
import { IVisitorRepository } from "@/lib/domain/interfaces/IVisitorRepository";
import { Visitor } from "@/lib/domain/entities/Visitor";
import { generateAlphanumericCode } from "@/lib/utils/codeGenerator";
import { generateQRCodeDataURL } from "@/lib/utils/qrGenerator";
import { sendVisitorPassEmail } from "@/lib/email/visitorPassEmail";
import {
  RegisterVisitorDTO,
  UpdateVisitorDTO,
  VisitorFilters,
  VisitorResult,
} from "@/types/visitor.types";

export class VisitorError extends Error {
  constructor(
    message: string,
    public readonly status: number = 400
  ) {
    super(message);
  }
}

/**
 * Encapsulates visitor business logic: code generation, QR rendering, and the
 * time-in/time-out lifecycle. Depends only on the repository abstraction.
 */
export class VisitorService implements IVisitorService {
  private readonly visitorRepository: IVisitorRepository;

  constructor(visitorRepository: IVisitorRepository) {
    this.visitorRepository = visitorRepository;
  }

  async registerVisitor(
    data: RegisterVisitorDTO,
    registrantId: string
  ): Promise<VisitorResult> {
    const accessCode = await this.generateUniqueCode();

    const record = await this.visitorRepository.create({
      ...data,
      accessCode,
      registeredById: registrantId,
    });

    const visitor = new Visitor(record);
    const qrCodeDataUrl = await generateQRCodeDataURL(accessCode);

    // Await the send so the result is accurate and the email isn't dropped on
    // serverless (functions can freeze right after the response is returned).
    // A failure must not block registration — the pass is still usable via the
    // access code / QR shown to the resident.
    let emailSent = false;
    try {
      await sendVisitorPassEmail({
        visitorName: data.fullName,
        visitorEmail: data.email,
        accessCode,
        qrCodeDataUrl,
        targetUnit: data.targetUnit,
        purpose: data.purpose,
        expectedArrival: data.expectedArrival,
      });
      emailSent = true;
    } catch (err) {
      console.error("[VisitorService] Failed to send pass email:", err);
    }

    return { visitor: visitor.toJSON(), accessCode, qrCodeDataUrl, emailSent };
  }

  async lookupByCode(code: string): Promise<Visitor | null> {
    const record = await this.visitorRepository.findByAccessCode(
      code.trim().toUpperCase()
    );
    return record ? new Visitor(record) : null;
  }

  async getVisitorById(id: string): Promise<Visitor | null> {
    const record = await this.visitorRepository.findById(id);
    return record ? new Visitor(record) : null;
  }

  async logTimeIn(visitorId: string): Promise<Visitor> {
    const existing = await this.getVisitorById(visitorId);
    if (!existing) throw new VisitorError("Visitor not found", 404);
    if (!existing.canTimeIn()) {
      throw new VisitorError(
        `Cannot log time-in for a visitor with status ${existing.status}`
      );
    }
    if (!existing.isExpected()) {
      throw new VisitorError(
        "Visitor is outside their expected arrival window (±4 hours)"
      );
    }
    const record = await this.visitorRepository.logTimeIn(visitorId);
    return new Visitor(record);
  }

  async logTimeOut(visitorId: string): Promise<Visitor> {
    const existing = await this.getVisitorById(visitorId);
    if (!existing) throw new VisitorError("Visitor not found", 404);
    if (!existing.canTimeOut()) {
      throw new VisitorError(
        `Cannot log time-out for a visitor with status ${existing.status}`
      );
    }
    const record = await this.visitorRepository.logTimeOut(visitorId);
    return new Visitor(record);
  }

  async getAllVisitors(filters?: VisitorFilters): Promise<Visitor[]> {
    const records = await this.visitorRepository.findAll(filters);
    return records.map((r) => new Visitor(r));
  }

  async updateVisitor(id: string, data: UpdateVisitorDTO): Promise<Visitor> {
    const existing = await this.getVisitorById(id);
    if (!existing) throw new VisitorError("Visitor not found", 404);
    const record = await this.visitorRepository.update(id, data);
    return new Visitor(record);
  }

  async deleteVisitor(id: string): Promise<void> {
    const existing = await this.getVisitorById(id);
    if (!existing) throw new VisitorError("Visitor not found", 404);
    await this.visitorRepository.delete(id);
  }

  /** Retry code generation until a unique one is found (collisions are rare). */
  private async generateUniqueCode(): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = generateAlphanumericCode();
      const existing = await this.visitorRepository.findByAccessCode(code);
      if (!existing) return code;
    }
    throw new VisitorError("Failed to generate a unique access code");
  }
}
