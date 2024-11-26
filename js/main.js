import { personIcon } from "./constant.js";
import { getIcon, getStatus } from "./helper.js";
import { ui } from "./ui.js";


//global değişkenler
var map;
let clickedCords;

let notes = JSON.parse(localStorage.getItem("notes")) || [];

let layer;





window.navigator.geolocation.getCurrentPosition(
    (e)=>{
        loadMap([e.coords.latitude,e.coords.longitude],"mevcut konum");
        
    },
    (e)=>{
        loadMap([39.921132, 32.861194],"varsayılan konum");

    }
);


function loadMap(CurrentPosition,msg){
     map = L.map('map',{zoomControl:false}).setView(CurrentPosition, 8);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

 
// katman eklemek 

layer =L.layerGroup().addTo(map);



L.control.zoom({
    position : "bottomright",

}).addTo(map);


    L.marker(CurrentPosition, {icon: personIcon}).addTo(map).bindPopup(msg);
 
    // haritanın izlenme olayı
    map.on("click",onMapClick);
    renderNotes();
    renderMarkers();
}


function onMapClick(e){
   clickedCords = [e.latlng.lat, e.latlng.lng];

    ui.aside.classList.add("add")
    
}

ui.CancelBtn.addEventListener("click",()=>{
    ui.aside.classList.remove("add")
});

ui.form.addEventListener("submit",(e)=>{

    e.preventDefault();
   const title = e.target[0].value;
   const date = e.target[1].value;
   const status = e.target[2].value;
    
   const newNote={
    id:new Date().getTime(),
    title,
    date,
    status,
    coords:clickedCords,
   } 

   notes.unshift(newNote);

   localStorage.setItem("notes",JSON.stringify(notes));

   ui.aside.classList.remove("add");

   e.target.reset();
   
   renderNotes();
   renderMarkers();

});

function renderMarkers(){

    // layer.clearlayers();

    notes.map((note)=>{
        const icon=getIcon(note.status);
        L.marker(note.coords,{icon}).addTo(layer).bindPopup(note.title);
    });
}



function renderNotes(){
    const noteCards = notes
    .map((note) => {
      // Tarih verisi istenilen formatta düzenlendi
      const date = new Date(note.date).toLocaleString("tr",{
        day:"2-digit",
        month:"long",
        year:"numeric",
      });


      const status = getStatus(note.status);


      return `<li>
          <div>
            <p>${note.title}</p>
            <p>${date}</p>
          
            <p>${status}</p>
          </div>
          <div class="icons">
            <i data-id="${note.id}" class="bi bi-airplane-fill" id="fly"></i>
            <i data-id="${note.id}" class="bi bi-trash-fill" id="delete"></i>
          </div>
        </li>`;
    })
    .join("");


    ui.ul.innerHTML=noteCards;
  
    document.querySelectorAll("li #delete").forEach((btn)=>{
        
        
        btn.addEventListener("click",()=> deletNote(btn.dataset.id)
           
            
    );
    });



    document.querySelectorAll("li #fly").forEach((btn)=>{
        btn.addEventListener("click",()=>{
            const id = btn.dataset.id;
            flyToLocation(id);
        })
    })



    
}

function deletNote(id){
   const res = confirm("silme işlemini onaylıyor musunuz?");
 
   if (res) {
    // `id`'si bilinen elemanı notes dizisinden kaldır
    notes = notes.filter((note) => note.id !== parseInt(id));

    // LocalStorage'ı güncelle
    localStorage.setItem("notes", JSON.stringify(notes));

    // Notları render et
    renderNotes();

    // Markerları render et
    renderMarkers();
  }

  

}


function flyToLocation(id) {
    // id'si bilinen elemanı notes dizisi içerisinden bul
    const note = notes.find((note) => note.id === parseInt(id));
  
    console.log(note);
     map.flyTo(note.coords, 12);
   
  }


  ui.arrow.addEventListener("click",()=>{
    ui.aside.classList.toggle("hide");
  })


