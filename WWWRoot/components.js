Vue.component('detailstable', {
    template: `
    <div v-if="item!=null" style="display:inline-block; vertical-align:top">
        <table>
            <tr v-for="key in keys">
            <td>
                {{key | capitalize}}
            </td>
            <td>
                <input v-if="typeof item[key] == 'string'" type="text" v-model="item[key]" />
                <input v-if="typeof item[key] == 'boolean'" type="checkbox" v-model="item[key]" />
                <div v-if="item[key]!=null && typeof item[key] == 'object' && item[key].type=='indicator'" :style="'width:5px; height:5px; border-radius:5px; background-color:black'"></div>
                <select v-if="item[key]!=null && typeof item[key] == 'object' && item[key].type=='dropdown'" v-model="item[key].value">
                    <option v-for="option in item[key].options" :value="option.id">{{option.name}}</option>
                </select>
                <div v-if="item[key]==null" style="font-style: italic;">null</div>
            </td>
            </tr>
        </table>
        <div>
            <button v-on:click="Save">Save</button>&nbsp;<button v-on:click="New">New</button>&nbsp;<button v-on:click="Delete">Delete</button>
        </div>
    </div>`,
    props: {
        keys: Array,
        item: Object
    },
    methods: {
        Save() {
            this.$emit('save', this.item);
        },
        Delete() {
            this.$emit('delete', this.item);
        },
        New() {
            this.$emit('new', this.item);
        }
    },
    filters: {
        capitalize: function (str) {
            return str.charAt(0).toUpperCase() + str.slice(1)
        }
    }
});

Vue.component('grid', {
    template: `
    <div :style="'overflow-y:auto; overflow-x:hidden; height:' + height + 'px; display:inline-block; vertical-align:top'">          
        <div class="header" style="width:100%">&nbsp;Search:&nbsp;<input style="display: inline-block; margin: 3px;" type="text" v-model="filterKey" />
        </div>
        <table>
        <thead style=""> 
            <tr>
            <th style="position:sticky; top: 0; " 
                v-for="key in columns"
                @click="sortBy(key)"
                :class="{ active: sortKey == key }">
                {{ key | capitalize }}
                <span class="arrow" :class="sortOrders[key] > 0 ? 'asc' : 'dsc'">
                </span>
            </th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="entry in filteredData" @click="$emit('selected',entry); selectValue(entry);" :style="entry==selectedValue ? 'font-weight:bolder;':''"> <!-- Emit the entry through the 'selected' event -->
            <td v-for="key in columns">
                <div v-if="typeof entry[key] == 'object' && entry[key]!=null && entry[key].type=='indicator'" :style="'width:15px; height:15px; border-radius:15px; background-color:' + entry[key].color"></div>
                <div v-if="entry[key]==null" style="font-style:italic">null</div>
                <div v-if="entry[key]!=null && typeof entry[key] == 'object' && entry[key].type=='dropdown'">{{entry[key].value}}</div>
                <div v-if="typeof entry[key] != 'object'">{{entry[key]}}</div>
            </td>
            </tr>
        </tbody>
        </table>
    </div>
    `,
    props: {
        data: Array,
        columns: Array,        
        height: String,
        width: String
    },
    data: function () {
        var sortOrders = {}
        this.columns.forEach(function (key) {
            sortOrders[key] = 1
        })
        return {            
            filterKey: this.filterKey || '',
            sortKey: this.sortKey || '',
            sortOrders: sortOrders,
            selectedValue: {}
        }
    },
    computed: {        
        filteredData: function () {
            var sortKey = this.sortKey
            var filterKey = this.filterKey && this.filterKey.toLowerCase()
            var order = this.sortOrders[sortKey] || 1
            var data = this.data
            if (filterKey) {
                data = data.filter(function (row) {
                    return Object.keys(row).some(function (key) {
                        return String(row[key]).toLowerCase().indexOf(filterKey) > -1
                    })
                })
            }
            if (sortKey) {
                data = data.slice().sort(function (a, b) {
                    a = a[sortKey]
                    b = b[sortKey]
                    return (a === b ? 0 : a > b ? 1 : -1) * order
                })
            }
            return data
        }
    },
    filters: {
        capitalize: function (str) {
            return str.charAt(0).toUpperCase() + str.slice(1)
        }
    },
    methods: {
        sortBy: function (key) {
            this.sortKey = key
            this.sortOrders[key] = this.sortOrders[key] * -1
        },
        selectValue: function (value) {
            this.selectedValue = value;
            
        }
    }
})