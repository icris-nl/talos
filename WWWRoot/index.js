var viewModel=new Vue({
    el: '#main',
    data: {
        timeseries: [],
        timeseriesColumns: ['name'],
        selectedTimeseries:{},
        sourcesColumns: ['Type', 'Name'],        
        sources: [],
        selectedSource:{},
        sourceKeys: ['Type', 'Name', 'Config'],

    },
    methods: {
        TimeseriesSelected:function(item){

        },
        SourceSelected:function(item){
            this.selectedSource=item;
        },
        SaveSource:function(){
            fetch('/talos/sources', {
                method: 'post',
                credentials: 'same-origin', //Needed for cookie authentication to Azure AD. Fuckers.
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.selectedSource)
            }).then(res => res.text())
                .then(res => {
                    console.log("Source posted");
                });
    
        },
        DeleteSource: function(){

        },
        NewSource: function(){
            this.selectedSource={
                Type:{
                    type:'dropdown',
                    options:[
                        {id: 'httppoll', name: 'httppoll'},
                        {id: 'tcplistener', name: 'tcplistener'},
                        {id: 'serial', name: 'serial'}
                    ],
                    value: ''
                },
                Name: '',
                Config: ''
            }
        }

    },
    mounted(){
        fetch('/talos/timeseries/measurements').then(res=>res.json()).then(result=>{
            this.timeseries=result;
        });
        fetch('/talos/sources', {
            method: 'get',
            credentials: 'same-origin', //Needed for cookie authentication to Azure AD. Fuckers.
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }            
        }).then(res => res.json())
            .then(res => {
                this.sources=res;
            });
        fetch('/talos/timeseries/events', {
            method: 'post',
            credentials: 'same-origin', //Needed for cookie authentication to Azure AD. Fuckers.
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ eventType: 'pageloaded', timestamp: new Date().getTime() })
        }).then(res => res.text())
            .then(res => {
                console.log("Pageload event posted");
            });

            //SELECT * FROM "sensorlog"."twoweeks"."dredgeview" WHERE archived=FALSE
    }
});