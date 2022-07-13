## NOTE 
nei test il server è chiamato con una funzione () => void, mentre la signature è del tipo (port: number) => void, quindi alla fine di che tipo è?


## Domande chieste 
1. Il socket ud4 è un tipo? non si trova nella documentazione se è un tipo
guarda in client 
2. Cosa significa questo? ``` ((port: number) => void)```, funzione che prende un numero e ritorna void?
3. Quali sono i principi per il testing? Credo di aver fatto qualcosa di molto a caso
4. Utilizzo dell'asinc con chai
5. Cose sulla sintassi riguardo cose simil a var ServerMock = require("mock-http-server")

## Su socket DGRAM
come affermato in questo post https://stackoverflow.com/questions/56003679/check-if-udp-socket-is-runing-on-a-certain-port-close-it-then-run-it-again 
se chiudo un socket non posso più ribindare una nuova porta, bisogna creare un nuovo socket

## DEBUG LOG
In questa parte presento cosa ho provato a fare per fixare il problema di compilazione dei file di test
dati nel template

### Resolve ora non prende più l'argomento vuoto.
Sembra che con un aggiornamento del compilatore di TS, da 4.0 a 4.1 non accetti più l'argomento vuoto.
https://stackoverflow.com/questions/65354965/error-ts2794-expected-1-arguments-but-got-0-did-you-forget-to-include-void
il motivo di questo è perché ora il tipo standard del resolve è 
```
new <T>(executor: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void): Promise<T>;
``` 
da *lib.es2015.promise.d.ts* 

#### Soluzione proposta
Esplicitamente marcare il return della promise come ```<void>```


### Sinon spy on last declaration
La libreria sinon utilizza con il tipo della funzione da spiare come l'ultima funzione dichiarata in dgram.d.ts
Ma noi vogliamo utilizzare la spy con un altra funzione. 

#### Soluzione proposta
Si propone la soluzione presente in questo post in stackoverlow, in cui si esegue una type assertion
sul tipo della funzione da spiare. 
https://stackoverflow.com/questions/68887818/using-sinon-spy-when-two-methods-have-the-same-name-but-different-arguments

#### Origini dell'errore
Non si conoscono ancora gli aggiornamenti o cambi che hanno reso necessario utilizzare questo metodo per risolvere il problema dei tipi

Sembra che l'index.d.ts di node non sia fatto in questo modo, e non è in grado di capire che quale versione gli serva...
https://stackoverflow.com/questions/54196399/function-overloading-in-index-d-ts-file

### test/Client.ts restore
Fa un restore troppo presto. 
nell'afterall fa un restore prima di chiamare disconnect, questo causa una chiamata socket send reale, e non 
più usando lo stub. 

#### Soluzione proposta
Invertire le due righe di codice, 
quindi invece di 
```
afterEach((done) =>
{
    sandbox.restore();
    client.disconnect().then(() => server.shutdown(done));
});
```
Avere questo: 
```
afterEach((done) =>
{
    client.disconnect().then(() => server.shutdown(done));
    sandbox.restore();
});
```

### test/Client.ts ultimo test
nell'ultimo test si va a testare se socket.on è chiamato due volte. 
Il problema è che anche send probabilmente (non sono riuscito a trovare il sourcecode) 
utilizza on, per ben due volte, quindi alla fine viene chiamato ben 4 volte. 

### test/Server.ts broadcast
Nonostante le chiamate effettivamente avvengono con hello, e avvengano effettivamente due volte
per qualche motivo che non si è compreso, withArgs().calledTwice).to.be.true è false, 
è come se withArgs non avesse registrato le chiamate, eppure l'unica variabile che checkava
effettivametne è il payload, ossia Hello, questo payload è corretto.