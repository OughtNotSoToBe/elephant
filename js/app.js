const loadOffers = () => {
    fetch("offers.html")
        .then(response => response.text())
        .then(async data => {
            document.getElementById("appContainer").innerHTML = data;
            await Promise.resolve(data)
                .then(initOffers())
        })
};

initPreloader();
loadOffers();
