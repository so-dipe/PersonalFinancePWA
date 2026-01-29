<script>
    import BarChart from "$lib/components/viz/BarChart.svelte";
    import { summariseTransactionsByCategories } from "$lib/domains/insights";

    export let start;
    export let end;

    $: startStr = start?.toISOString().slice(0, 10);
    $: endStr = end?.toISOString().slice(0, 10);

    let data;

    $: if (startStr && endStr) {
        data = summariseTransactionsByCategories(startStr, endStr);
    }

    $: barchartData = $data?.map(d => ({
        x: d.category.name,
        y: d.total
    }))

    console.log($data);
    console.log(barchartData);
</script>

<BarChart data={barchartData} />