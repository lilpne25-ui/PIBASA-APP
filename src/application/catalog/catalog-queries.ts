import { shapeTypes, type ShapeType } from "@/domain/catalog/shapes";
import type { CatalogRepository, GradeDetail, GradeFilter, GradeSummary } from "./ports";

export class ListGrades {
  constructor(private readonly repo: CatalogRepository) {}

  async execute(filter: GradeFilter = {}): Promise<GradeSummary[]> {
    const q = filter.q?.trim().slice(0, 60);
    const shape = filter.shape && (shapeTypes as readonly string[]).includes(filter.shape) ? (filter.shape as ShapeType) : undefined;
    return this.repo.listGrades({ familyCode: filter.familyCode?.trim() || undefined, shape, q: q || undefined });
  }
}

export class GetGradeDetail {
  constructor(private readonly repo: CatalogRepository) {}

  async execute(slug: string): Promise<GradeDetail | null> {
    if (!/^[a-z0-9-]{1,40}$/.test(slug)) return null;
    return this.repo.findGradeBySlug(slug);
  }
}
