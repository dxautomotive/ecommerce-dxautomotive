import { MedusaService } from "@medusajs/framework/utils"
import { Vehicle } from "./models/vehicle"

class VehicleCompatibilityModuleService extends MedusaService({
  Vehicle,
}) {
  /**
   * Gera o slug determinístico de um veículo a partir de marca+modelo+ano.
   * Ex: ("Toyota", "Corolla XEi", 2020) → "toyota-corolla-xei-2020"
   */
  static slugify(make: string, modelName: string, year: number): string {
    const norm = (s: string) =>
      s
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
    return `${norm(make)}-${norm(modelName)}-${year}`
  }
}

export default VehicleCompatibilityModuleService
