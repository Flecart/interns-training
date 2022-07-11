
export class Challenge {
    public async buzz(input: number): Promise<string | number> {
        if (input % 3 === 0 && input % 5 === 0) {
            return 'fizzbuzz';
        } else if (input % 3 === 0) {
            return 'fizz';
        } else if (input % 5 === 0) {
            return 'buzz';
        } else {
            return input;
        }
    }
}