let adjustedObserver = false

const docTitle = document.documentURI.split("?")[0].split("/").at(-1)
console.log("new document: ", docTitle)


let observer = new MutationObserver(function(mutations) {
    let last = mutations[mutations.length-1]
    if (mutations.length === 3 && last.target.nodeName.toLowerCase() === 'span') {
        if (!adjustedObserver) {
            adjustedObserver = true
            observer.disconnect()

            observer.observe(document.querySelector(`.${mutations[0].target.className}`), {
                subtree:       true,
                childList:     true,
                characterData: true,
                characterDataOldValue: true
            });
        }

        document.dispatchEvent(new MessageEvent('eventHistory-listener', {
            data: JSON.stringify({
                kind: "speaker",
                name: mutations[0].addedNodes.item(0).innerText.split('\n')[0],
                document: docTitle
            })
        }))
        document.dispatchEvent(new MessageEvent('eventHistory-listener', {
            data: JSON.stringify({
                kind: "text",
                old : last.removedNodes?.item(0)?.textContent,
                new: last.addedNodes.item(0).textContent,
                document: docTitle
            })
        }))


    }else if (last.target.nodeName.toLowerCase() === 'span') {
        const event = new MessageEvent('eventHistory-listener', {
            data: JSON.stringify({
                kind: "text",
                old : last.removedNodes?.item(0)?.textContent,
                new: last.addedNodes.item(0).textContent,
                document: docTitle
            })
        });
        document.dispatchEvent(event)
    }
});

observer.observe(document.querySelector("body"), {
    subtree:       true,
    childList:     true,
    characterData: true,
    characterDataOldValue: true
});

function connect() {
    const ws = new WebSocket('ws://localhost:7143');

    document.addEventListener('eventHistory-listener', (e) => {
        if (ws.readyState === ws.OPEN) {
            ws.send(e.data)
        }
    }, false)

    ws.onopen = function (e) {
        ws.send(JSON.stringify({
            kind:     "newDoc",
            document: docTitle
        }))
    }


    ws.onclose = function(e) {
        console.log('Socket is closed. Reconnect will be attempted in 10 seconds.', e.reason);
        setTimeout(function() {
            connect();
        }, 10000);
    };

    ws.onerror = function(err) {
        console.error('Socket encountered error: ', err, 'Closing socket');
        ws.close();
    };
}

connect();