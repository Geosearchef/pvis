
const initial_population_distribution = [758000,762000,765000,764000,818000,808000,817000,832000,842000,849000,823000,815000,788000,785000,768000,786000,775000,795000,792000,786000,802000,821000,827000,853000,886000,939000,955000,980000,1020000,1012000,994000,1004000,1030000,1044000,1075000,1166000,1149000,1173000,1146000,1124000,1089000,1080000,1080000,1097000,1085000,1087000,1033000,1015000,1002000,981000,953000,961000,964000,1037000,1132000,1168000,1247000,1298000,1324000,1352000,1347000,1363000,1342000,1290000,1261000,1208000,1162000,1086000,1049000,1009000,964000,932000,890000,874000,842000,826000,783000,697000,639000,539000,458000,591000,576000,531000,608000,595000,539000,452000,374000,313000,257000,198000,128000,100000,80000,63000,43000,30000,19000,13000];
const survival_prob = [0.996928535,0.99976897,0.99983275,0.99986979,0.999892215,0.99990618,0.999915115,0.9999211,0.999925115,0.999926985,0.999926345,0.999922625,0.999914865,0.99990133,0.999880215,0.999850575,0.99981228,0.99976747,0.999722345,0.99968737,0.999668025,0.99966255,0.999666485,0.99967441,0.99968092,0.9996816,0.999675785,0.999663805,0.999645775,0.99962171,0.999591625,0.999555595,0.999513575,0.99946561,0.99941189,0.99935289,0.999289455,0.9992221,0.9991502,0.99907283,0.99898878,0.9988965,0.998794085,0.9986798,0.99855221,0.9984097,0.99825048,0.998072545,0.99787364,0.99765125,0.99740255,0.9971244,0.996813305,0.99646536,0.996076215,0.99564103,0.99515446,0.99461063,0.994003125,0.993324945,0.992570345,0.991738055,0.990829685,0.989850055,0.98880791,0.987716245,0.986579505,0.98538578,0.984117015,0.9827489,0.981249695,0.97958011,0.97771033,0.975619025,0.97328379,0.970681395,0.96778833,0.964574055,0.960960885,0.956833175,0.95204178,0.946393905,0.93963907,0.931503655,0.92181605,0.910444375,0.89729721,0.88235074,0.865676865,0.847393105,0.827593505,0.806426375,0.78410362,0.760897115,0.737122365,0.712979825,0.688525135,0.663773745,0.63870768,0.6132803,0.590763365];

const current_total_volume = 360_000_000_000.0;
const stable_pension = current_total_volume / 18_500_000.0; // 17362000 renten gezahlt bei 1550 = 322 mrd 
const stable_fee = current_total_volume / 59_100_000.0;

let populationChart = null;
let dependanceChart = null;
let effectChart = null;

const ORANGE = "rgba(245, 146, 8, 1)";
const ORANGE_BACK = "rgba(245, 146, 8, 0.4)";
const GREEN = "rgba(61, 144, 6, 1)";
const GREEN_BACK = "rgba(61, 144, 6, 0.4)";
const RED = "rgba(243, 50, 32, 1)";
const RED_BACK = "rgba(243, 50, 32, 0.4)";
const BLUE = "rgba(17, 139, 232, 1)";
const BLUE_BACK = "rgba(17, 139, 232, 0.4)";

function init_controls() {
    document.getElementById("pension-advantage-factor").value = 50;
    document.getElementById("reproduction-rate").value = 135;
    document.getElementById("migration-rate").value = 0;
    document.getElementById("migration-rate-out-per-fee").value = 0;
    document.getElementById("time_machine_birth_factor").value = 100;
    document.getElementById("pension-age").value = 65;
    document.getElementById("stock-investment").value = 200_000_000_000;
    document.getElementById("stock-return").value = 7;
    document.getElementById("birth-rate-drop-per-fee").value = 0;
}

function update_charts() {
    time_machine_birth_factor = Number(document.getElementById("time_machine_birth_factor").value) / 100.0;

    pension_advantage_factor = Number(document.getElementById("pension-advantage-factor").value) / 100.0;
    

    minor_threshold = 18; // 15
    senior_threshold = Number(document.getElementById("pension-age").value); // 65

    reproductionRate = Number(document.getElementById("reproduction-rate").value) / 100.0;
    reproductionAge = 30;

    migration_rate = Number(document.getElementById("migration-rate").value);
    migration_rate_per_fee = Number(document.getElementById("migration-rate-out-per-fee").value) * -1;

    stock_investment = Number(document.getElementById("stock-investment").value);
    stock_return_rate = Number(document.getElementById("stock-return").value) / 100.0;
    stock_payment_time = 20;

    birth_rate_drop_per_fee = Number(document.getElementById("birth-rate-drop-per-fee").value) / 100.0;

    populationData = [];
    minorData = [];
    seniorData = [];
    dependentData = [];
    workingData = [];
    dependanceRatioData = [];
    seniorDependanceRatioData = [];
    pensionData = [];
    feeData = [];
    labels = [];

    populationDistribution = [...initial_population_distribution];

    
    // time machine population increase
    for(i = 10;i < 35;i++) {
        populationDistribution[i] *= time_machine_birth_factor;
    }

    fee_last_year = 0;

    for(year = 0; year < 50; year++) {
        // kill people
        for(i = 0; i < 100;i++) {
            populationDistribution[i] = Math.floor(populationDistribution[i] * (survival_prob[i]));
        }

        // migrate people
        migration_rate_year = migration_rate + Math.max(-1000000.0, migration_rate_per_fee * Math.max(0.0, fee_last_year - 580.0));

        for(i = 10; i < 50;i++) {
            populationDistribution[i] += migration_rate_year / 40;
        }

        // birth people
        adjusted_reproductive_rate = reproductionRate * Math.pow((1.0 - birth_rate_drop_per_fee), Math.max(0.0, fee_last_year - 580.0) / 100.0);

        populationDistribution.pop();
        populationDistribution.unshift(Math.floor(populationDistribution[reproductionAge] / 2.0 * adjusted_reproductive_rate));

        // analyze
        populationSize = populationDistribution.reduce((acc, next) => acc + next, 0);
        populationData.push(populationSize);

        minorSize = populationDistribution.slice(0, minor_threshold).reduce((acc, next) => acc + next, 0);
        seniorSize = populationDistribution.slice(senior_threshold + 1, 100).reduce((acc, next) => acc + next, 0);
        dependentSize = minorSize + seniorSize;
        workingSize = populationSize - dependentSize;
        minorData.push(minorSize);
        seniorData.push(seniorSize);
        dependentData.push(dependentSize);
        workingData.push(workingSize);

        dependanceRatio = workingSize / dependentSize;
        seniorDependanceRatio = workingSize / seniorSize;
        dependanceRatioData.push(dependanceRatio);
        seniorDependanceRatioData.push(seniorDependanceRatio);

        // Money
        volume_at_stable_pension = seniorSize * stable_pension;
        volume_at_stable_fee = workingSize * stable_fee;

        desired_volume = volume_at_stable_pension * pension_advantage_factor + volume_at_stable_fee * (1.0 - pension_advantage_factor);

        stock_total = 0;

        // stock gains
        stock_total += stock_investment * stock_return_rate;

        // stock payment
        if(year < stock_payment_time) {
          stock_total -= stock_investment / stock_payment_time;
        }

        pension = desired_volume / seniorSize / 12.0;
        fee = (desired_volume - stock_total) / workingSize / 12.0;

        fee_last_year = fee;
        
        pensionData.push(pension);
        feeData.push(fee);

        labels.push(2025 + year);
    }
    
    populationChart.data.datasets[0].data = populationData;
    populationChart.data.datasets[1].data = workingData;
    populationChart.data.datasets[2].data = dependentData;
    // populationChart.data.datasets[3].data = seniorData;
    // populationChart.data.datasets[4].data = minorData;

    dependanceChart.data.datasets[0].data = dependanceRatioData;
    dependanceChart.data.datasets[1].data = seniorDependanceRatioData;

    effectChart.data.datasets[0].data = pensionData;
    effectChart.data.datasets[1].data = feeData;

    populationChart.data.labels = labels;
    dependanceChart.data.labels = labels;
    effectChart.data.labels = labels;

    populationChart.update();
    dependanceChart.update();
    effectChart.update();
}

function create_charts() {
    const populationCtx = document.getElementById("population-chart");
    const dependanceCtx = document.getElementById("dependance-chart");
    const effectCtx = document.getElementById("effect-chart");

    populationChart = new Chart(populationCtx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            {
                label: 'Total Population',
                data: [],
                borderWidth: 1,
                borderColor: RED,
                backgroundColor: RED_BACK,
            },
            {
                label: 'Working Population',
                data: [],
                borderWidth: 1,
                borderColor: ORANGE,
                backgroundColor: ORANGE_BACK,
            },
            {
                label: 'Dependant Population',
                data: [],
                borderWidth: 1,
                borderColor: BLUE,
                backgroundColor: BLUE_BACK,
            },
            // {
            //     label: 'Senior Population',
            //     data: [],
            //     borderWidth: 1
            // },
            // {
            //     label: 'Minor Population',
            //     data: [],
            //     borderWidth: 1
            // },
        ]
        },
        options: {
          scales: {
            y: {
              beginAtZero: false
            }
          }
        }
      });

      dependanceChart = new Chart(dependanceCtx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            {
                label: 'Workers per Dependant',
                data: [],
                borderWidth: 1,
                borderColor: BLUE,
                backgroundColor: BLUE_BACK,
            },
            {
                label: 'Workers per Senior',
                data: [],
                borderWidth: 1,
                borderColor: GREEN,
                backgroundColor: GREEN_BACK,
            },
        ]
        },
        options: {
          scales: {
            y: {
              beginAtZero: false
            }
          }
        }
      });
      
      effectChart = new Chart(effectCtx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            {
                label: 'Pension (¤/mon)',
                data: [],
                borderWidth: 1,
                borderColor: GREEN,
                backgroundColor: GREEN_BACK,
            },
            {
                label: 'Contribution (¤/mon)',
                data: [],
                borderWidth: 1,
                borderColor: ORANGE,
                backgroundColor: ORANGE_BACK,
            },
        ]
        },
        options: {
          scales: {
            y: {
              beginAtZero: false
            }
          }
        }
      });


    
      update_charts();
}

window.setInterval(update_charts, 50);
window.onload = () => {
    init_controls();
    create_charts();
};

