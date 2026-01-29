<script>
    import { formatAmountShort, formatFinancial } from "$lib/utils";
    import * as d3 from "d3";
    import { createEventDispatcher, onMount } from "svelte";
    import { draw } from "svelte/transition";

    export let data = [];
    export let width = 1000;
    export let height = 300;

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };

    const dispatch = createEventDispatcher();

    let svg;

    $: if (data.length) render();

    function render() {
        d3.select(svg).selectAll("*").remove();

        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const root = d3.select(svg)
            .attr("width", width)
            .attr("height", height);

        const g = root.append("g")
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
            .attr("rx", 6)
            .attr("ry", 6)
            .attr("fill", "var(--green-700)")
            .on("mouseenter", function (event, d) {
                dispatch("hover", {
                    content: formatFinancial(d.y),
                    x: event.pageX,
                    y: event.pageY
                });
                d3.select(this)
                    .attr("fill", "var(--green-900)")
                    .attr("stroke-width", 1);
            })
            .on("mousemove", function (event) {
                dispatch("move", {
                    x: event.pageX,
                    y: event.pageY
                })
            })
            .on("mouseleave", function () {
                dispatch("hover", null);
                d3.select(this)
                    .attr("fill", "var(--green-700)")
                    .attr("stroke", null);
            })

        //Data Labels
        const labels = g.selectAll(".label-group")
            .data(data)
            .enter()
            .append("g")
            .attr("class", "label-group")
            .each(function (d) {
                const barHeight = innerHeight - y(d.y);
                const inside = barHeight > 50;

                const xPos = x(d.x) + x.bandwidth() / 2;
                const yPos = inside ? y(d.y) + barHeight/2 : y(d.y) - 15;

                const text = d3.select(this)
                    .append("text")
                    .attr("x", xPos)
                    .attr("y", yPos)
                    .attr("text-anchor", "middle")
                    .attr("dominant-baseline", inside ? "middle" : "auto")
                    .attr("fill", inside ? "fff" : "#0f3d2e")
                    .attr("font-size", 11)
                    .text(formatAmountShort(d.y))
                
                const bbox = text.node().getBBox();

                d3.select(this)
                    .insert("rect", "text")
                    .attr("x", bbox.x - 6)
                    .attr("y", bbox.y - 4)
                    .attr("width", bbox.width + 12)
                    .attr("height", bbox.height + 12)
                    .attr("rx", 6)
                    .attr("ry", 6)
                    .attr("fill", inside ? "rgba(255, 255, 255, 0.75)" : "var(--green-100)")
                    .attr("box-shadow", "var(--shadow-md)");
            });
        
        g.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", d => x(d.x))
            .attr("y", d => y(d.y))
            .attr("width", x.bandwidth())
            .attr("height", d => innerHeight - y(d.y))
            .attr

        // Axes
        g.append("g")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(d3.axisBottom(x));

    }

    onMount(() => {
        if (data.length) render();
    })
</script>

<svg bind:this={svg}></svg>
