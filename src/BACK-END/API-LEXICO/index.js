import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import moo from 'moo';
import nearley from 'nearley';


const app = express();
const PORT = 3001;

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());

let lexer = moo.compile({
    WS:      /[ \t]+/,
    float:   /0\.[0-9]+|[1-9][0-9]*\.[0-9]+|\.[0-9]+/,
    integer: /[0-9]+/,
    plus:    '+',
    minus:   '-',
    times:   '*',
    div:     '/',
    lparen:  '(',
    rparen:  ')',
    NL:      { match: /\n/, lineBreaks: true },
});

app.post('/analizador/lexico', (req, res) => {
    try {
        const { expresion } = req.body;

        lexer.reset(expresion);
        let token;
        let resultado = [];
        let linea = 1;
        while (token = lexer.next()) {
            if (token.type !== 'NL' && token.type !== 'WS') {
                resultado.push({
                    linea,
                    tipo: token.type,
                    valor: token.value,
                    posicion: token.col - 1
                });
            }
            if (token.type === 'NL') {
                linea++;
            }
        }

        res.send({ resultado });
    } catch (error) {
        res.status(500).send({ error: error.toString() });
        console.error(error);
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});