require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const PDFDocument = require('pdfkit');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public')); 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ROTA DA IA
app.post('/api/chat', async (req, res) => {
    try {
        const { pergunta } = req.body;
        if (!pergunta) return res.status(400).json({ erro: "Envie uma pergunta!" });

        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
        const result = await model.generateContent(`Você é um robô sarcástico: ${pergunta}`);
        const respostaDaIA = result.response.text();

        res.json({ resposta: respostaDaIA });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro na IA" });
    }
});

// ROTA DO PDF (Corrigida e com LOG)
app.post('/api/gerar-pdf', (req, res) => {
    const { texto } = req.body;
    console.log("📄 Gerando PDF para o texto recebido...");

    if (!texto) return res.status(400).send("Texto vazio");

    try {
        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=relatorio.pdf');

        doc.pipe(res);
        doc.fontSize(20).text("Relatório da IA", { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(texto);
        doc.end();
    } catch (erro) {
        console.error("Erro no PDF:", erro);
        res.status(500).send("Erro ao gerar PDF");
    }
});

// ESSA PARTE É OBRIGATÓRIA PARA O SERVIDOR NÃO FECHAR:
const PORTA = 3000;
app.listen(PORTA, () => {
    console.log(`🚀 SERVIDOR LIGADO EM http://localhost:${PORTA}`);
});