function newUUID() {
    //Implementation from https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

function ToastMessage(message, error) {
    var x = document.getElementById("snackbar");
    if (error != null && error) {
        x.style.backgroundColor = 'red';
    }
    else {
        x.style.backgroundColor = '#222222';
    }
    x.innerHTML = message;
    x.className = "show";
    setTimeout(function () { x.className = x.className.replace("show", ""); }, error ? 9000 : 3000);
}


// Store a copy of the fetch function
var _oldFetch = fetch;

// Create our new version of the fetch function
window.fetch = function () {

    // Create hooks
    var fetchStart = new Event('fetchStart', { 'view': document, 'bubbles': true, 'cancelable': false });
    var fetchEnd = new Event('fetchEnd', { 'view': document, 'bubbles': true, 'cancelable': false });

    // Pass the supplied arguments to the real fetch function
    var fetchCall = _oldFetch.apply(this, arguments);

    // Trigger the fetchStart event
    document.dispatchEvent(fetchStart);

    fetchCall.then(function (response) {
        var message = response.status;
        switch (response.status) {
            case 401:
            case 403:
                message = "No access to resource.";
                break;
            case 500:
                message = "Server-side exception, please try again or contact support."
                break;
            default:
                break;
        }

        // Trigger the fetchEnd event
        document.dispatchEvent(fetchEnd);
        if (!response.ok) {
            console.log("error", response);
            ToastMessage("Request failed " + message, true);
        } else {
            ToastMessage("Request finished.");
        }
    }).catch(function () {
        // Trigger the fetchEnd event
        document.dispatchEvent(fetchEnd);
        ToastMessage("Request failed " + message, true);
    });

    return fetchCall;
};

document.addEventListener('fetchStart', function () {
    console.log("Show spinner");
    document.getElementById("loader").style.display = "block";
});

document.addEventListener('fetchEnd', function () {
    console.log("Hide spinner");
    document.getElementById("loader").style.display = "none";
});

function padLeft(nr, n, str) {
    return Array(n - String(nr).length + 1).join(str || '0') + nr;
}