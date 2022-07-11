import {Calculator, Operation} from '../src/Calculator';
import {Webpage} from '../src/Webpage';
import {expect} from 'chai';
import { resolve } from 'dns';

describe('Level 2 - Calculator', () =>
{
    let challenge: Calculator;

    beforeEach(() => challenge = new Calculator());

    it('should perform simple add from 0', async () =>
    {
        challenge.operation(Operation.ADD);
        challenge.input(10); 
        expect(challenge.result).to.equal(10);
    });

    it('should perform simple sub from 0', async () =>
    {
        challenge.operation(Operation.SUB);
        challenge.input(10); 
        expect(challenge.result).to.equal(-10);
    });

    it('should perform simple mul of 0', async () =>
    {
        challenge.operation(Operation.MUL);
        challenge.input(10); 
        expect(challenge.result).to.equal(0);
    });

    it('should perform simple div of 0', async () =>
    {
        challenge.operation(Operation.DIV);
        challenge.input(10); 
        expect(challenge.result).to.equal(0);
    });

    it('should perform simple MUL from 1', async () =>
    {
        challenge.operation(Operation.ADD);
        challenge.input(1); 
        
        challenge.operation(Operation.MUL);
        challenge.input(10); 
        expect(challenge.result).to.equal(10);
    });

    it('should perform simple DIV from 10', async () =>
    {
        challenge.operation(Operation.ADD);
        challenge.input(10); 
        
        challenge.operation(Operation.DIV);
        challenge.input(2); 
        expect(challenge.result).to.equal(5);
    });

    it('result should throw Error on un-executed operation', async () =>
    {
        challenge.operation(Operation.ADD);
        // https://stackoverflow.com/questions/21587122/mocha-chai-expect-to-throw-not-catching-thrown-errors
        expect(() => {challenge.result}).to.throw(Error)
    });

    it('result should throw Error on double-operation', async () =>
    {
        challenge.operation(Operation.ADD);
        expect(() => {challenge.operation(Operation.MUL);}).to.throw(Error)
    });
});

describe('Level 2 - Webpage', () => {
    var ServerMock = require("mock-http-server")
    var sinon = require("sinon")
    var server = new ServerMock({ host: "localhost", port: 9000 });
    let webpage: Webpage;

    beforeEach(function(done) {
        server.start(done);
        webpage = new Webpage(); 
    });

    afterEach(function(done) {
        server.stop(done);
        sinon.restore();
    });

    it('should make the correct get request', async () => {
        var jsonMessage = JSON.stringify({ hello: "world" });
        server.on({
            method: 'GET',
            path: '/resource',
            reply: {
                status:  200,
                headers: { "content-type": "application/json" },
                body:    jsonMessage
            }
        });
        expect(await webpage.getWebpage("http://localhost:9000/resource")).to.equal(jsonMessage)
    });

    it('should reject incorrect url in get request', async () => {
        // https://stackoverflow.com/questions/33756027/fail-a-test-with-chai-js
        // TODO(angelo): non so come gestire il fatto che la richiesta è async e devo
        // aspettare che venga rigettata, questo codice non funziona
        // expect( async () => {
        //     await webpage.getWebpage("randomdfasdafs")
        // } ).to.throw( Error );
        // quindi utilizzo un codice simile a quanto sotto, non è la soluzione migliore

        await webpage.getWebpage("randomdfasdafs")
            .catch(err => expect(err).to.be.an('error'))
    });

    it('saveWebpage should return correct path on correct url and path', async () => {
        
        var jsonMessage = JSON.stringify({ hello: "world" });
        server.on({
            method: 'GET',
            path: '/resource',
            reply: {
                status:  200,
                headers: { "content-type": "application/json" },
                body:    jsonMessage
            }
        });
        var writeFileStub = sinon.stub(webpage, "_writeFile")
            .returns(new Promise((resolve, _) => {
                resolve("ok");
            }))
        // webpage = new Webpage();
        expect(await webpage.saveWebpage("http://localhost:9000/resource", "./")).to.equal("ok");
        writeFileStub.restore(); 
    });
});

