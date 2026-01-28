<script>
    import * as d3 from "d3";
    import { onMount } from "svelte";
    import { draw } from "svelte/transition";

    export let data = [];
    export let width = 600;
    export let height = 300;

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    let svgEl;

    $: if (data.length) drawChart();

    function drawChart() {
        d3.select(svgEl).selectAll("*").remove();

        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const svg = d3.select(svgEl)
            .attr("width", width)
            .attr("height", height);

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand()
            .domain(data.map(d => d.x))
            .range([0, innerWidth])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.y)])
            .nice()
            .range([innerHeight, 0]);

        // Bars
        g.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", d => x(d.x))
            .attr("y", d => y(d.y))
            .attr("width", x.bandwidth())
            .attr("height", d => innerHeight - y(d.y))
            .attr("fill", "#2fbf71");

        // Axes
        g.append("g")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(d3.axisBottom(x));

        g.append("g")
            .call(d3.axisLeft(y));
    }

    onMount(() => {
        if (data.length) drawChart();
    })
</script>

<svg bind:this={svgEl}></svg>
