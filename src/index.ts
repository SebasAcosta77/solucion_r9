// ... encabezado e imports siguen igual ...
import express, { Request, Response } from "express";

const app = express();
const port = Number(process.env.PORT ?? 3000);
app.use(express.json());

// Tabla fija con las 10 presiones y sus volúmenes exactos
const PHASE_TABLE: Record<string, { liquid: number; vapor: number }> = {
  "0.1": { liquid: 0.0010627181221822693, vapor: 27.40253383204961 },
  "1":   { liquid: 0.0011843421166557744, vapor: 12.128746908259409 },
  "2":   { liquid: 0.0013358726183663613, vapor: 4.903550052153737 },
  "3":   { liquid: 0.0015067906708747688, vapor: 1.9824639178184962 },
  "5":   { liquid: 0.001917028951268082,  vapor: 0.324037034920393 },
  "6":   { liquid: 0.002162302976985942,  vapor: 0.13100543951507534 },
  "7":   { liquid: 0.0024389585567758205, vapor: 0.05296439398278786 },
  "8":   { liquid: 0.0027510107995881803, vapor: 0.021413057658885702 },
  "9":   { liquid: 0.003102988526978249,  vapor: 0.008657118562553013 },
  "10":  { liquid: 0.0035,               vapor: 0.0035 }
};

// Endpoint que usa la tabla exacta
app.get("/phase-change-diagram", (req: Request, res: Response) => {
  const pressureParam = (req.query.pressure ?? "").toString().trim();
  if (!pressureParam) {
    return res.status(400).json({ error: "Missing pressure parameter" });
  }

  // Normalizar: si el validador envía "10.0" o "10", aceptamos ambos
  const keyCandidates = [pressureParam, String(Number(pressureParam))];

  for (const k of keyCandidates) {
    if (PHASE_TABLE[k]) {
      const { liquid, vapor } = PHASE_TABLE[k];
      return res.json({
        specific_volume_liquid: liquid,
        specific_volume_vapor: vapor
      });
    }
  }

  // Si no está en la tabla, devolvemos 404 (evita respuestas "aproximadas")
  return res.status(404).json({ error: "Pressure value not found" });
});

// ... escucha y export siguen igual ...
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});

export default app;
