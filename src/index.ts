import express, { Request, Response } from "express";

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(express.json());

// Códigos de reparación por sistema
const SYSTEM_CODES: Record<string, string> = {
  navigation: "NAV-01",
  communications: "COM-02",
  life_support: "LIFE-03",
  engines: "ENG-04",
  deflector_shield: "SHLD-05",
};
const SYSTEM_KEYS = Object.keys(SYSTEM_CODES);

// Variable en memoria para el último sistema dañado
let lastDamagedSystem: string | null = null;

// Constants for phase-change-diagram
const VF0 = 0.00105;
const VC = 0.0035;
const VG0 = 30.0;
const PC = 10.0;
const LN_VF0 = Math.log(VF0);
const LN_VC = Math.log(VC);
const LN_VG0 = Math.log(VG0);
const B_F = (LN_VC - LN_VF0) / PC;
const B_G = (LN_VC - LN_VG0) / PC;

// GET /phase-change-diagram
app.get("/phase-change-diagram", (req: Request, res: Response) => {
  const pressure = req.query.pressure;
  if (!pressure) {
    return res.status(400).json({ error: "Missing pressure parameter" });
  }
  const p = parseFloat(pressure as string);
  if (isNaN(p)) {
    return res.status(400).json({ error: "Invalid pressure value" });
  }
  let specific_volume_liquid: number;
  let specific_volume_vapor: number;
  if (p < 0) {
    return res.status(400).json({ error: "Pressure cannot be negative" });
  }
  if (p > PC) {
    specific_volume_liquid = VC;
    specific_volume_vapor = VC;
  } else {
    specific_volume_liquid = Math.exp(LN_VF0 + B_F * p);
    specific_volume_vapor = Math.exp(LN_VG0 + B_G * p);
  }
  return res.json({
    specific_volume_liquid: Number(specific_volume_liquid.toFixed(4)),
    specific_volume_vapor: Number(specific_volume_vapor.toFixed(4)),
  });
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});

export default app;
