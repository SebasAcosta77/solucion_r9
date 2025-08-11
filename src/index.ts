import express, { Request, Response } from "express";

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(express.json());

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
  const pressureParam = req.query.pressure;
  if (!pressureParam) {
    return res.status(400).json({ error: "Missing pressure parameter" });
  }

  const p = parseFloat(pressureParam as string);
  if (isNaN(p) || p < 0) {
    return res.status(400).json({ error: "Invalid pressure value" });
  }

  let specific_volume_liquid: number;
  let specific_volume_vapor: number;

  // Always use curve equations, even above PC, to avoid step changes
  specific_volume_liquid = Math.exp(LN_VF0 + B_F * Math.min(p, PC));
  specific_volume_vapor = Math.exp(LN_VG0 + B_G * Math.min(p, PC));

  res.json({
    specific_volume_liquid,
    specific_volume_vapor,
  });
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});

export default app;
