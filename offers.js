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

const initOffers = () => {
    initPreloader();
    currentPage = 1;
    pageListSize = 5;
    getOffers();
};

const startIndex = () => {
    return currentPage * pageListSize - pageListSize
};

const endIndex = () => {
    return currentPage * pageListSize
};

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

// Here be dragons - tread lightly!
// Just kidding, but UGH! This function takes 3 global variables that represent nested object properties, and converts them into a single 
// property value on which to sort the items that are returned by the map function. The property keys can be either 1, 2, or 3 levels deep:
// item.foo, item.foo.bar, or item.foo.bar.baz
// Dot notation doesn't support variables, so I came up with this ugly thing.
//
// TO DO: Figure out a regex or some other (ANY other) solution to handle this...
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

const processOffers = () => {
    currentPage = 1;
    offersList = fetchedOffers.sort(sortJSON());
    numberOfPages = Math.ceil(offersList.length / pageListSize);
    pageList = () => { return offersList.slice(startIndex(), endIndex()) };
    renderPage = pageList().map(genTemplate).join("\n");
    document.getElementById("offerList").innerHTML=renderPage;
    setPagination();
}

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
    prop3 = args[2];
    args.length === 3
        ? getOffers(prop1, prop2, prop3)
        : args.length === 2
        ? getOffers(prop1, prop2)
        : getOffers(prop1);
        setPagination();
};


const processDate = (start, end) => {
    const date1 = new Date(start);
    const date2 = new Date(end);
    
    const days = {
        0: "Sun",
        1: "Mon",
        2: "Tue",
        3: "Wed",
        4: "Thu",
        5: "Fri",
        6: "Sat"
    }

    const months = {
        0: 1,
        1: 2,
        2: 3,
        3: 4,
        4: 5,
        5: 6,
        6: 7,
        7: 8,
        8: 9,
        9: 10,
        10: 11,
        11: 12
    }

    const formatHours = (date) => {
        return date.getHours() < 10
            ? "0" + date.getHours()
            : date.getHours();
    }
    const formatMinutes = (date) => {
        return date.getMinutes() < 10
            ? "0" + date.getMinutes()
            : date.getMinutes();
    }

    const date1_output = () => {
        return days[date1.getDay()] + " "
        + months[date1.getMonth()] + "/"
        + date1.getDate() + " "
        + formatHours(date1) + ":"
        + formatMinutes(date1);
    }
    
    const date2_output = () => {
        return date2 === date1
            ? ""
            : " - " + formatHours(date2)
                + ":" + formatMinutes(date2);
    }

    const renderDate = () => {
        return date1_output() + date2_output();
    }

    return renderDate();
};

const genTemplate = item => {
    const pickupStart = item.origin.pickup.start;
    const pickupEnd = item.origin.pickup.end;
    const dropoffStart = item.destination.dropoff.start;
    const dropoffEnd = item.destination.dropoff.end;
    const price = Math.trunc(item.offer);
    const distance = (number) => {
        return number.toLocaleString();
    }

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
                                <div class="offers-content-list-offer-details-waypoints-terminals-departure-date">${processDate(pickupStart, pickupEnd)}</div>
                            </div>
                            <div class="offers-content-list-offer-details-waypoints-terminals-arrival">
                                <div class="offers-content-list-offer-details-waypoints-terminals-arrival-destination">${item.destination.city}, ${item.destination.state}</div>
                                <div class="offers-content-list-offer-details-waypoints-terminals-arrival-date">${processDate(dropoffStart, dropoffEnd)}</div>
                            </div>
                        </div>
                    </div>
                    <div class="offers-content-list-offer-details-mileage">${distance(item.miles)} miles</div>
                    <div class="offers-content-list-offer-details-price">$${price}</div>
                </div>
            </div>`
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
