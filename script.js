//let request = "https://coronavirus-19-api.herokuapp.com/all";
let request = 'https://coronavirus-19-api.herokuapp.com/countries/'; //JSON path
let currentCountry = "World";
//get source checked attribute
let mode = document.querySelector('input[type="radio"][name="tabs"][checked]').value;   
//datas for chart
let countriesInGraph = [],
    casesByCountry = [],
    deathsByCountry = [],
    countColumns = 20;
// interactive elements
const countryList = document.querySelector('#slct');
const mottoProperty = document.querySelector('.motto-property');
const toggleView = document.querySelectorAll('input[type="radio"][name="tabs"]');

async function getData(url){
    let datas = await fetch(url)
    .then(response => response.json())
    .then(object => render(object))
}
// convert 12500 to 12 500
function renderNumber(num){
    return (num+"").replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ');
}
function render(datas){
    const infoOuters = document.querySelectorAll('.output-info');
    infoOuters[0].textContent = renderNumber(datas.cases);
    infoOuters[1].textContent = renderNumber(datas.deaths);
    infoOuters[2].textContent = renderNumber(datas.recovered);
    infoOuters[3].textContent = renderNumber(datas.todayCases);
    infoOuters[4].textContent = renderNumber(datas.todayDeaths);
    // createGraph(request); - weak changes will not
    // be visible on the chart
}
async function getCountries(url){// setting list of countries to the select element
    let datas = await fetch(url)
    .then(response => response.json())
    .then(object => 
        object.forEach((item, i)=>{
            countryList.insertAdjacentHTML('beforeend', `<option value="${item.country}">${item.country}</option>`);
        })  
    )
}
function checkWidth(width){  // change count columns of datas depending on the width 
    if(width <= 750 && width > 550 ){
        countColumns = 15;
    }else if(width <= 550 && width > 450){
        countColumns = 10;
    }else if(width <= 450){
        countColumns = 7;
    }
}

document.addEventListener('DOMContentLoaded', ()=>{//default settings and requests
    checkWidth(window.innerWidth);
    getData(request + currentCountry);
    setInterval(() => {
        getData(request + currentCountry);
        console.count('iteration');
    }, 75000)
    createGraph(request);
    getCountries('https://coronavirus-19-api.herokuapp.com/countries');
});

window.addEventListener('resize', ()=>{
    checkWidth(window.innerWidth);
});

toggleView.forEach((item)=>{    //change mode chart
    item.addEventListener('change', (e)=>{
        mode = e.target.value;
        createGraph(request);
    });
})

countryList.addEventListener('change', (e)=>{   // change motto property
    currentCountry = e.target.value;
    getData(request + currentCountry);
    mottoProperty.textContent = "in the " + currentCountry;
});

async function createGraph(url){    //create graph
    if(window.chart != null){
        window.chart.destroy();
    }
    let datas = await fetch(url)
    .then(response => response.json())
    .then(object => {
        countriesInGraph = [];
        casesByCountry = [];
        deathsByCountry = [];
        object.forEach((item, i)=>{
            if(mode === 'whole'){
                if(item.country !== "World" && i < countColumns){
                    countriesInGraph.push(item.country);
                    casesByCountry.push(item.cases);
                    deathsByCountry.push(item.deaths);
                }
            }else{
                if(item.country !== "World" && countriesInGraph.length < countColumns && item.todayCases > 100){
                    countriesInGraph.push(item.country);
                    casesByCountry.push(item.todayCases);
                    deathsByCountry.push(item.todayDeaths);
                }
            }
        });
        console.count("Graph");
    });
    var ctx = document.getElementById('myChart').getContext('2d');
    Chart.defaults.global.defaultFontColor = "#fff";
    window.chart = new Chart(ctx, {     // chart.js configuraton
        type: 'bar', 
        scaleFontColor: "azure",
        data: {
            labels: countriesInGraph,
            datasets: [{
                label: 'Cases',
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
                data: casesByCountry
            },{
                label: 'Deaths',
                backgroundColor: '#117',
                borderColor: '#117',
                data: deathsByCountry
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        }
    });
}
