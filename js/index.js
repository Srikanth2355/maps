let map;
let infowindow;
var markers = [];

function initMap() {
    let LosAngeles = {
        lat: 34.0633,
        lng: -118.3580
    }
    map = new google.maps.Map(document.getElementById("map"), {
        center: LosAngeles,
        zoom: 11,
    });
    infowindow = new google.maps.InfoWindow();
}

const onEnter =(e)=> {
    if(e.key == "Enter"){
        getStores();
    }
}

const noStoresFound = ()=> {
    const html = `
    <div class="no-stores-found">
        No stores Found
    </div>
    `
    document.querySelector(".stores-list").innerHTML = html;
}

const getStores = () => {
    const zipCode = document.getElementById('zip-code').value;
    // console.log(zipCode);
    if(!zipCode){
        return;
    }
    // const API_URL = 'http://localhost:3000/api/stores';
    const API_URL = 'https://blooming-basin-36667.herokuapp.com/api/stores';
    const fullUrl = `${API_URL}?zip_code=${zipCode}`;
    fetch(fullUrl)
        .then((response) => {
            if (response.status == 200) {
                return response.json()
            } else {
                throw new Error(response.status)
            }
        })
        .then((data) => {
            if(data.length > 0){
                clearLocations()
                searchlocationNear(data)
                setStoresList(data)
                setOnClickListener()
            } else {
                clearLocations()
                noStoresFound();
            }
            
        })
}

const clearLocations = ()=> {
    infowindow.close();
    for(var i=0;i< markers.length;i++){
        markers[i].setMap(null);
    }
    markers.length = 0;
}

const searchlocationNear = (stores) => {
    let bounds = new google.maps.LatLngBounds();
    stores.forEach((store, index) => {
        let latlng = new google.maps.LatLng(
            store.location.coordinates[1],
            store.location.coordinates[0]
        )
        let name = store.storeName;
        let address = store.addressLines[0];
        let openStatusText = store.openStatusText;
        let phone = store.phoneNumber;
        bounds.extend(latlng);
        createMarker(latlng, name, address, openStatusText, phone, index + 1);
    })
    map.fitBounds(bounds)
}

const createMarker = (latlng, name, address, openStatusText, phone, storeNumber) => {
    let html = `
    <div class="store-info-window">
        <div class="store-info-name">${name}</div>
        <div class="store-info-open-status">${openStatusText}</div>
        <div class="store-info-address">
            <div class="icon">
                <i class="fas fa-location-arrow"></i>
            </div>
            <span>${address}</span>
        </div>
        <div class="store-info-phone">
            <div class="icon">
                <i class="fas fa-phone"></i>
            </div>
            <span>
             <a href="tel:${phone}">${phone}</a>
            </span>
        </div>
    
    </div>
    `
    var marker = new google.maps.Marker({
        position: latlng,
        map: map,
        label: `${storeNumber}`,
    });

    google.maps.event.addListener(marker, 'click', function () {
        infowindow.setContent(html);
        infowindow.open(map, marker);
    })
    markers.push(marker);
}

const setStoresList = (storesdata) => {
    let store = '';
    storesdata.forEach((storedata, index) => {
        store += `<div class="store-container">
        <div class="store-container-background">
            <div class="store-info-container">
                <div class="store-address">
                    <span>${storedata.addressLines[0]}</span>
                    <span>${storedata.addressLines[1]}</span>
                </div>
                <div class="store-phone-number">${storedata.phoneNumber}</div>
            </div>
            <div class="store-number-container">
                <div class="store-number">
                    ${index+1}
                </div>
            </div>
        </div>
    </div>`
    })
    document.querySelector(".stores-list").innerHTML = store;
}

const setOnClickListener = () => {
    let storeElements = document.querySelectorAll(".store-container");
    storeElements.forEach((elem,index) => {
        elem.addEventListener('click', () => {
            google.maps.event.trigger(markers[index], 'click');
        })
    })
}