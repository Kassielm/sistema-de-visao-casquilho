const express = require("express");
const cors = require("cors");
const snap7 = require("node-snap7");
const path = require("path");

const app = express();
const s7client = new snap7.S7Client();

app.use(express.json());
app.use(cors());

const PLC_IP = "172.18.176.220";
let lastReadValue = null; // Variável para armazenar o último valor lido

// Conectar ao PLC
app.get("/connect", (req, res) => {
  s7client.ConnectTo(PLC_IP, 0, 2, (err) => {
    if (err) {
      return res.status(500).json({ error: s7client.ErrorText(err) });
    }
    res.json({ message: "Conectado ao PLC!" });
  });
});

function plcConnect(ip) {
  return new Promise((resolve, reject) => {
    s7client.ConnectTo(ip, 0, 1, function (err) {
      if (err) {
        console.log(
          " >> Connection failed. Code #" +
            err +
            " - " +
            s7client.ErrorText(err)
        );
        return reject(err);
      }

      console.log(" >> Connected");
      resolve();
    });
  });
}

plcConnect(PLC_IP).then(() => {
  console.log("Conectado ao PLC!");
});

app.post("/write", async (req, res) => {
  const { value, wordLength = 2 } = req.body;
  console.log("Valor recebido:", value);

  if (typeof value !== "number") {
    console.log("Valor inválido", value);
    return res.status(400).json({ error: "Valor inválido" });
  }

  if (![2, 4].includes(wordLength)) {
    return res.status(400).json({ error: "wordLength inválido. Use 2 (Int16) ou 4 (Int32)." });
  }

  const buffer = Buffer.alloc(wordLength);

  try {
    if (wordLength === 2) {
      buffer.writeInt16BE(value, 0); // Int16 (2 bytes)
    } else {
      buffer.writeInt32BE(value, 0); // Int32 (4 bytes)
    }

    // Escrever no PLC (DB100, byte 14)
    s7client.MBWrite(1, 2, buffer, (err) => {
      if (err) {
        console.log("Erro ao escrever no PLC:", s7client.ErrorText(err));
        return res.status(500).json({ error: s7client.ErrorText(err) });
      }
      console.log(`Valor ${value} escrito com sucesso no PLC.`);
      res.json({ message: "Valor escrito com sucesso" });
    });

  } catch (error) {
    console.log("Erro ao processar a escrita:", error);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
});

// Retorna o último valor lido do PLC
app.get("/read", (req, res) => {
  res.json({ value: lastReadValue });
});

// Função para ler continuamente do PLC
async function listenAndProcess() {
  while (true) {
    try {
      s7client.DBRead(100, 14, 2, (err, data) => {
        if (!err) {
          lastReadValue = data.readUInt16BE(0);
          console.log("Valor atualizado do PLC:", lastReadValue);
        } else {
          console.log("Erro ao ler do PLC:", s7client.ErrorText(err));
        }
      });
    } catch (error) {
      console.error("Erro no loop de leitura:", error);
    }
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
}

// Iniciar leitura contínua
listenAndProcess();

// Servir o Angular (quando buildado)
app.use(express.static(path.join(__dirname, "../dist/sistema-de-visao-casquilho")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/sistema-de-visao-casquilho/browser/index.html"));
});

// Iniciar servidor
const PORT = 4201;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
