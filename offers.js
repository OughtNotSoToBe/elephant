let currentPage = 1;
const pageListSize = 5;
let numberOfPages;
let offersList;
let pageList;
let renderPage;
const startIndex = () => { return currentPage * pageListSize - pageListSize };
const endIndex = () => { return currentPage * pageListSize };

const getOffers = (prop1, prop2, prop3) => {
    document.getElementById("offerList").innerHTML="";
    currentPage = 1;
    fetch("https://convoy-mock-api.herokuapp.com/offers")
        .then(res => res.json())
        .then((data) => {
            offersList = data.sort(sortJSON(prop1, prop2, prop3));
            numberOfPages = Math.ceil(data.length / pageListSize);
            pageList = () => { return offersList.slice(startIndex(), endIndex()) };
            renderPage = pageList().map(genTemplate).join("\n");
            document.getElementById("offerList").innerHTML=renderPage;
            document.getElementById("pageStatus").innerHTML="Showing " + (startIndex() + 1) + " - " + endIndex() + " of " + offersList.length + " offers";
    }).catch(err => console.error(err));
}

const sortJSON = (prop1, prop2, prop3) => {
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
        console.log("prop1", prop1, "prop2", prop2, "prop3", prop3, textA, textB);
        return (textA < textB)
            ? -1
            : (textA > textB)
            ? 1
            : 0;
    }
}

const genTemplate = item => {
    const local = new Date();
    const timezoneOffset = local.getTimezoneOffset() / 60;
    const pickupDateStart = item.origin.pickup.start.split("T")[0];
    const pickupDateEnd = item.origin.pickup.end.split("T")[0] === pickupDateStart
        ? ""
        : item.origin.pickup.end.split("T")[0] + ", ";
    let pickupTimeStart = item.origin.pickup.start.split("T")[1].substring(0,5);
    let ptsHour = parseInt(pickupTimeStart.substring(0,2)) - timezoneOffset < 0 
        ? parseInt(pickupTimeStart.substring(0,2)) - timezoneOffset + 24
        : parseInt(pickupTimeStart.substring(0,2)) - timezoneOffset;
    if(ptsHour < 10) {
        ptsHour = "0" + ptsHour;
    }
    pickupTimeStart = ptsHour + pickupTimeStart.substring(2, 6);
    let pickupTimeEnd = item.origin.pickup.end.split("T")[1].substring(0,5) === pickupTimeStart
        ? ""
        : item.origin.pickup.end.split("T")[1].substring(0,5);
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

    return `<div class="offer">
                <div class="offer-label">
                    <!-- <div class="offer-label-requested">REQUESTED</div> -->
                </div>
                <div class="offer-details">
                    <div class="offer-details-waypoints">
                        <div class="offer-details-waypoints-connectorDots">
                            <div class="offer-details-waypoints-connectorDots-dot"></div>
                            <div class="offer-details-waypoints-connectorDots-connector"></div>
                            <div class="offer-details-waypoints-connectorDots-dot"></div>
                        </div>
                        <div class="offer-details-waypoints-terminalss">
                            <div class="offer-details-waypoints-terminals-departure">
                                <div class="offer-details-waypoints-terminals-departure-origin">${item.origin.city}, ${item.origin.state}</div>
                                <div class="offer-details-waypoints-terminals-departure-date">${pickupWindow}</div>
                            </div>
                            <div class="offer-details-waypoints-terminals-arrival">
                                <div class="offer-details-waypoints-terminals-arrival-destination">${item.destination.city}, ${item.destination.state}</div>
                                <div class="offer-details-waypoints-terminals-arrival-date">${dropoffWindow}</div>
                            </div>
                        </div>
                    </div>
                    <div class="offer-details-mileage">${item.miles} miles</div>
                    <div class="offer-details-price">$${price}</div>
                </div>
            </div>`
};

(init => {
    getOffers("origin", "pickup", "start");
    document.getElementById("previousPage").style.visibility="hidden";
})();

document.addEventListener("input", (e) => {
    if (e.target.id !== "selectSortCriteria") {
        return;
    }
    const option = {
        pickup: "origin,pickup,start",
        dropoff: "destination,dropoff,start",
        price: "offer",
        origin: "origin,city",
        destination: "destination,city",
        distance: "miles"
    }    
    let args = option[e.target.value].split(',');    
    console.log(args[0] + ', ' + args[1] + ', ' + args[2]);
    args.length === 3
        ? getOffers(args[0], args[1], args[2])
        : args.length === 2
        ? getOffers(args[0], args[1])
        : getOffers(args[0]);
});

document.addEventListener("click", (e) => {
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
    document.getElementById("previousPage").style.visibility = currentPage === 1 ? "hidden" : "visible";
    document.getElementById("nextPage").style.visibility = currentPage === numberOfPages ? "hidden" : "visible";
    document.getElementById("pageStatus").innerHTML="Showing " + (startIndex() + 1) + " - " + endIndex() + " of " + offersList.length + " offers";
});
