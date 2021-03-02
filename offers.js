let preloader;
let currentPage;
let fetchedOffers;
let pageListSize;
let numberOfPages;
let offersList;
let pageList;
let renderPage;
let prop1 = "origin";
let prop2 = "pickup";
let prop3 = "start";
let sortOptions = "pickup";
const startIndex = () => { return currentPage * pageListSize - pageListSize };
const endIndex = () => { return currentPage * pageListSize };

const initPreloader = () => {
    fetch("preloader.html")
        .then(response => response.text())
        .then(data => preloader = data)
}

const getOffers = () => {
    document.getElementById("offerList").innerHTML=preloader;
    fetch("https://convoy-mock-api.herokuapp.com/offers")
        .then(response => response.json())
        .then(async data =>  { 
            fetchedOffers = data
            await Promise.resolve(data)
                .then(processOffers())
    })
    .catch(err => console.error(err));
}

const processOffers = () => {
    currentPage = 1;
    offersList = fetchedOffers.sort(sortJSON());
    numberOfPages = Math.ceil(offersList.length / pageListSize);
    pageList = () => { return offersList.slice(startIndex(), endIndex()) };
    renderPage = pageList().map(genTemplate).join("\n");
    document.getElementById("offerList").innerHTML=renderPage;
    setPagination();
}

// The actual sort property comes from one of three possible levels within the JSON object:
//      "foo"
//      "foo.bar"
//      "foo.bar.baz"
// You can pass a variable with index notation, but not with dot notation.
//      This mess below is a cumbersome solution
//
// TO DO: Figure out a regex or some other solution to handle this!
const sortJSON = () => {
    return function(a, b) {
        let textA = !prop3
            ? !prop2
                ? a[prop1]
                : a[prop1][prop2]
            : a[prop1][prop2][prop3];
        let textB = !prop3
            ? !prop2
                ? b[prop1]
                : b[prop1][prop2]
            : b[prop1][prop2][prop3];
        return (textA < textB)
            ? -1
            : (textA > textB)
            ? 1
            : 0;
    }
}

// The "genTemplate" function does way too many things. Need to split this up.
const genTemplate = item => {
    const local = new Date();
    // This converts the time from zulu to the local time zone of the client.
    // It would be more ideal to correct for the time zones of the origin and destination.
    // TO DO: Make sure that when local time and zulu time fall on a different day,
        // the date change also gets reflected in the UI
        // (This should be done before the date string is split)
    const timezoneOffset = local.getTimezoneOffset() / 60;
    const pickupDateStart = item.origin.pickup.start.split("T")[0];
    const pickupDateEnd = item.origin.pickup.end.split("T")[0] === pickupDateStart
        ? ""
        : item.origin.pickup.end.split("T")[0] + ", ";
    let pickupTimeStart = item.origin.pickup.start.split("T")[1].substring(0,5);
    // ptsHour (pickupTimeStart hour) represents the characters in the string that represent the hour.
        // and this definition keeps the hour out of negative values after applying the time zone offset.
        // TO DO: Really need to convert the time back to the standard date string, then apply the offset
            // so that all this garbage can be deleted.
    let ptsHour = parseInt(pickupTimeStart.substring(0,2)) - timezoneOffset < 0 
        ? parseInt(pickupTimeStart.substring(0,2)) - timezoneOffset + 24
        : parseInt(pickupTimeStart.substring(0,2)) - timezoneOffset;
    if (ptsHour < 10) {
        ptsHour = "0" + ptsHour;
    }
    pickupTimeStart = ptsHour + pickupTimeStart.substring(2, 6);
    let pickupTimeEnd = item.origin.pickup.end.split("T")[1].substring(0,5) === pickupTimeStart
        ? ""
        : item.origin.pickup.end.split("T")[1].substring(0,5);
    // pteHour (pickupTimeEnd Hour) - see the comment for ptsHour ^^
    let pteHour = pickupTimeEnd.length > 0 && parseInt(pickupTimeEnd.substring(0,2)) - timezoneOffset < 0
        ? parseInt(pickupTimeEnd.substring(0,2)) - timezoneOffset + 24
        : parseInt(pickupTimeEnd.substring(0,2)) - timezoneOffset;
    if (pteHour < 10) {
        pteHour = "0" + pteHour;
    }
    pickupTimeEnd = pteHour + pickupTimeEnd.substring(2, 6);
    const startPickup = pickupDateStart + ", " + pickupTimeStart;
    const endPickup = !pickupDateEnd 
        ? pickupTimeEnd
        : pickupDateEnd + pickupTimeEnd;
    const pickupWindow_isRange = !pickupDateEnd && !pickupTimeEnd
        ? false
        : true;
    const pickupWindow = pickupWindow_isRange
        ? startPickup + " - " + endPickup
        : startPickup;
    const dropoffDateStart = item.destination.dropoff.start.split("T")[0];
    const dropoffDateEnd = item.destination.dropoff.end.split("T")[0] === dropoffDateStart
        ? ""
        : item.destination.dropoff.end.split("T")[0] + ", ";
    const dropoffTimeStart = item.destination.dropoff.start.split("T")[1].substring(0,5);
    const dropoffTimeEnd = item.destination.dropoff.end.split("T")[1].substring(0,5) === dropoffTimeStart
        ? ""
        : item.destination.dropoff.end.split("T")[1].substring(0,5);
    const startDropoff = dropoffDateStart + ", " + dropoffTimeStart;
    const endDropoff = !dropoffDateEnd
        ? dropoffTimeEnd
        : dropoffDateEnd + dropoffTimeEnd;
    const dropoffWindow_isRange = !dropoffDateEnd && !dropoffTimeEnd
        ? false
        : true;
    const dropoffWindow = dropoffWindow_isRange
        ? startDropoff + " - " + endDropoff
        : startDropoff;
    const price = Math.trunc(item.offer);

    return `<div class="offers-content-list-offer">
                <div class="offers-content-list-offer-label">
                    <!-- This "requested" identifier was in the red line doc... when is it ever used? -->
                    <!-- <div class="offers-content-list-offer-label-requested">REQUESTED</div> -->
                </div>
                <div class="offers-content-list-offer-details">
                    <div class="offers-content-list-offer-details-waypoints">
                        <div class="offers-content-list-offer-details-waypoints-connectorDots">
                            <div class="offers-content-list-offer-details-waypoints-connectorDots-dot"></div>
                            <div class="offers-content-list-offer-details-waypoints-connectorDots-connector"></div>
                            <div class="offers-content-list-offer-details-waypoints-connectorDots-dot"></div>
                        </div>
                        <div class="offers-content-list-offer-details-waypoints-terminalss">
                            <div class="offers-content-list-offer-details-waypoints-terminals-departure">
                                <div class="offers-content-list-offer-details-waypoints-terminals-departure-origin">${item.origin.city}, ${item.origin.state}</div>
                                <div class="offers-content-list-offer-details-waypoints-terminals-departure-date">${pickupWindow}</div>
                            </div>
                            <div class="offers-content-list-offer-details-waypoints-terminals-arrival">
                                <div class="offers-content-list-offer-details-waypoints-terminals-arrival-destination">${item.destination.city}, ${item.destination.state}</div>
                                <div class="offers-content-list-offer-details-waypoints-terminals-arrival-date">${dropoffWindow}</div>
                            </div>
                        </div>
                    </div>
                    <div class="offers-content-list-offer-details-mileage">${item.miles} miles</div>
                    <div class="offers-content-list-offer-details-price">$${price}</div>
                </div>
            </div>`
};

const initOffers = () => {
    initPreloader();
    currentPage = 1;
    pageListSize = 5;
    getOffers();
};

const processDate = () => {

};

const setPagination = () => {
    document.getElementById("previousPage").style.visibility = currentPage === 1 ? "hidden" : "visible";
    document.getElementById("nextPage").style.visibility = currentPage === numberOfPages ? "hidden" : "visible";
    const endIndex_max = () => { return endIndex() > offersList.length ? offersList.length :  endIndex() }
    const displayedOffers = () => { 
        return (startIndex() + 1) === endIndex_max()
            ? endIndex_max()
            : (startIndex() + 1) + " - " + endIndex_max();
    }
    document.getElementById("pageStatus").innerHTML = "Showing " + displayedOffers() + " of " + offersList.length;
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

const processSelection = (pageSizeOption, sortSelection) => {
    const options = {
        pickup: "origin,pickup,start",
        dropoff: "destination,dropoff,start",
        price: "offer",
        origin: "origin,city",
        destination: "destination,city",
        distance: "miles"
    }
    sortOptions = sortSelection;
    pageListSize = pageSizeOption == "all" ? offersList.length : pageSizeOption;
    let sortProps = options[sortSelection];
    args = sortProps.split(',');
    prop1 = args[0];
    prop2 = args[1];
    prop3 = args[3];
    args.length === 3
        ? getOffers(prop1, prop2, prop3)
        : args.length === 2
        ? getOffers(prop1, prop2)
        : getOffers(prop1);
        setPagination();
};

document.addEventListener("input", (e) => {
    if (e.target.id === "offerSortSelector") {
        processSelection(pageListSize, e.target.value);
    } else if (e.target.id === "pageSizeSelector") {
        processSelection(e.target.value, sortOptions)
    } else {
        return;
    }
});

document.addEventListener("click", (e) => {
    if (!e.target.classList.contains("button")) {
        return;
    }
    if (e.target.id === "nextPage") {
        document.getElementById("offerList").innerHTML="";
        currentPage += 1;
        renderPage = pageList().map(genTemplate).join("\n");
        document.getElementById("offerList").innerHTML=renderPage;
    }
    if (e.target.id === "previousPage") {
        document.getElementById("offerList").innerHTML="";
        currentPage -= 1;
        renderPage = pageList().map(genTemplate).join("\n");
        document.getElementById("offerList").innerHTML=renderPage;
    }
    setPagination();
});
