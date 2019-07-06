var viewModel = new Vue({
    el: '#main',
    data: {
        timeseries: [],
        timeseriesColumns: ['name'],
        selectedTimeseries: {},
        sourcesColumns: ['Type', 'Name'],
        sources: [],
        selectedSource: {},
        sourceKeys: ['Type', 'Name', 'Config'],
        status: {
            influxdb: 'unknown',
            mongodb: 'unkown',
            cloud: 'unknown',
            app: 'running'
        }
    },
    methods: {
        TimeseriesSelected: function (item) {

        },
        SourceSelected: function (item) {
            this.selectedSource = item;
        },
        CreateTimeseries: function (item) {

        },
        SaveSource: function () {
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
        RefreshSysmon() {
            var frame = document.getElementById("sysgraphs");
            frame.src = frame.src;
        },
        DeleteSource: function () {

        },
        NewSource: function () {
            this.selectedSource = {
                Type: {
                    type: 'dropdown',
                    options: [
                        { id: 'httppoll', name: 'httppoll' },
                        { id: 'tcplistener', name: 'tcplistener' },
                        { id: 'serial', name: 'serial' }
                    ],
                    value: ''
                },
                Name: '',
                Config: ''
            }
        },
        Restart: function () {
            fetchWithTimeout('/restart', {
                method: 'get',
                credentials: 'same-origin', //Needed for cookie authentication to Azure AD. Fuckers.
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            }, 1000).then(result => result.json()).then(result => this.status.app = 'ok').catch(e => {
                this.status.app = 'restart initiated, refreshing the page in a few seconds...';
                setTimeout(function () { window.location.reload(true); }, 5000);
            });
        }

    },
    mounted() {
        fetch('/talos/timeseries/measurements').then(res => res.json()).then(result => {
            this.timeseries = result;
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
                this.sources = res;
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

        fetchWithTimeout('/talos/test', {
            method: 'get',
            credentials: 'same-origin', //Needed for cookie authentication to Azure AD. Fuckers.
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        }, 5000).then(result => result.json()).then(result => this.status.mongodb = 'ok').catch(e => this.status.mongodb = e.message);
        fetchWithTimeout('/talos/timeseries/measurements', {
            method: 'get',
            credentials: 'same-origin', //Needed for cookie authentication to Azure AD. Fuckers.
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        }, 5000).then(result => result.json()).then(result => this.status.influxdb = 'ok').catch(e => this.status.influxdb = e.message);
        //SELECT * FROM "sensorlog"."twoweeks"."dredgeview" WHERE archived=FALSE
    }
});