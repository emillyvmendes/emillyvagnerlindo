require('dotenv').config();
const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const PDFDocument = require('pdfkit');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public')); // Serve o arquivo HTML da pasta public

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ROTA 1: Enviar pergunta para a IA
app.post('/chat', async (req, res) => {
    try {
        const { prompt } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const result = await model.generateContent(prompt);
        const resposta = result.response.text();
        
        res.json({ texto: resposta });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro na IA" });
    }
});

// ROTA 2: Gerar e enviar o PDF
app.post('/gerar-pdf', (req, res) => {
    const { texto } = req.body;
    const doc = new PDFDocument();

    // Configura o cabeçalho para download de arquivo
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=resultado.pdf');

    doc.pipe(res);

    // Conteúdo do PDF
    doc.fontSize(20).text("Relatório da IA", { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(texto, { align: 'justify' });
    
    doc.end();
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
