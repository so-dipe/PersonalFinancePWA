<script>
    import DateRangePicker from "$lib/components/DateRangePicker.svelte";
    import BarChart from "$lib/components/viz/BarChart.svelte";
    import CalendarHeatmap from "$lib/components/viz/CalendarHeatmap.svelte";
    import TransactionsInTheLastYear from "$lib/features/insights/TransactionsInTheLastYear.svelte";

    import * as d3 from "d3";


    let start = new Date();
    let end = new Date();

    function onDateChange(e) {
        start = e.detail.start;
        end = e.detail.end;
    }

</script>

<DateRangePicker bind:start bind:end on:change={onDateChange} />
<BarChart data={[
    { x: 'Jan 1', y: 10 },
    { x: 'Jan 2', y: 20 },
    { x: 'Jan 3', y: 30 }
]} width={500} height={250}/>

<TransactionsInTheLastYear />

