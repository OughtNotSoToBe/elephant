fetch("https://convoy-mock-api.herokuapp.com/offers")
    .then(res => res.json())
    .then((data) => {
        let offers = data.map(genTemplate).join("\n");
        document.getElementById("offerList").innerHTML=offers;
}).catch(err => console.error(err));

const genTemplate = (item) => {
    const local = new Date();
    const timezoneOffset = local.getTimezoneOffset() / 60;
    const pickupDateStart = item.origin.pickup.start.split("T")[0];
    const pickupDateEnd = item.origin.pickup.end.split("T")[0] === pickupDateStart ? "" : item.origin.pickup.end.split("T")[0] + ", ";
    let pickupTimeStart = item.origin.pickup.start.split("T")[1].substring(0,5);
    let ptsHour = parseInt(pickupTimeStart.substring(0,2)) - timezoneOffset < 0 ? parseInt(pickupTimeStart.substring(0,2)) - timezoneOffset + 24 : parseInt(pickupTimeStart.substring(0,2)) - timezoneOffset;
    if(ptsHour < 10) {
        ptsHour = "0" + ptsHour;
    }
    pickupTimeStart = ptsHour + pickupTimeStart.substring(2, 6);
    let pickupTimeEnd = item.origin.pickup.end.split("T")[1].substring(0,5) === pickupTimeStart ? "" : item.origin.pickup.end.split("T")[1].substring(0,5);
    let pteHour = pickupTimeEnd.length > 0 && parseInt(pickupTimeEnd.substring(0,2)) - timezoneOffset < 0 ? parseInt(pickupTimeEnd.substring(0,2)) - timezoneOffset + 24 : parseInt(pickupTimeEnd.substring(0,2)) - timezoneOffset;
    if (pteHour < 10) {
        pteHour = "0" + pteHour;
    }
    pickupTimeEnd = pteHour + pickupTimeEnd.substring(2, 6);
    const startPickup = pickupDateStart + ", " + pickupTimeStart;
    const endPickup = !pickupDateEnd ? pickupTimeEnd : pickupDateEnd + pickupTimeEnd;
    const pickupWindow_isRange = !pickupDateEnd && !pickupTimeEnd ? false : true;
    const pickupWindow = pickupWindow_isRange ? startPickup + " - " + endPickup : startPickup;
    const connectorLength = pickupWindow_isRange ? "longer" : "";
    const dropoffDateStart = item.destination.dropoff.start.split("T")[0];
    const dropoffDateEnd = item.destination.dropoff.end.split("T")[0] === dropoffDateStart ? "" : item.destination.dropoff.end.split("T")[0] + ", ";
    const dropoffTimeStart = item.destination.dropoff.start.split("T")[1].substring(0,5);
    const dropoffTimeEnd = item.destination.dropoff.end.split("T")[1].substring(0,5) === dropoffTimeStart ? "" : item.destination.dropoff.end.split("T")[1].substring(0,5);
    const startDropoff = dropoffDateStart + ", " + dropoffTimeStart;
    const endDropoff = !dropoffDateEnd ? dropoffTimeEnd : dropoffDateEnd + dropoffTimeEnd;
    const dropoffWindow_isRange = !dropoffDateEnd && !dropoffTimeEnd ? false : true;
    const dropoffWindow = dropoffWindow_isRange ? startDropoff + " - " + endDropoff : startDropoff;

    return `<div class="offer">
                <div class="offer-label">
                    <!-- <div class="offer-label-requested">REQUESTED</div> -->
                </div>
                <div class="offer-details">
                    <div class="offer-details-waypoints">
                        <div class="offer-details-waypoints-connectorDots">
                            <div class="offer-details-waypoints-connectorDots-dot"></div>
                            <div class="offer-details-waypoints-connectorDots-connector ${connectorLength}"></div>
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
                    <div class="offer-details-price">$${item.offer}</div>
                </div>
            </div>`
    }


