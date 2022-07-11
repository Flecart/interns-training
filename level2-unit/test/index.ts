import {Calculator, Operation} from '../src/Calculator';
import {Webpage} from '../src/Webpage';
import {expect} from 'chai';

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
        expect(() => {challenge.result}).to.throw('Pending operation... Insert a value.')
    });

    it('result should throw Error on double-operation', async () =>
    {
        challenge.operation(Operation.ADD);
        expect(() => {challenge.operation(Operation.MUL);}).to.throw('Pending operation... Insert a value.')
    });
});

describe('Level 2 - Webpage', () => {
    
});

