<script>
    import * as d3 from "d3";
    import { createEventDispatcher, onMount } from "svelte";

    export let data = [];

    let svg;
    let width = 1000;
    let height = 180;

    const cellSize = 16;
    const cellGap = 2;
    const margin = { top: 20, right: 20, bottom: 20, left: 40 };

    const format = d3.timeFormat("%Y-%m-%d");

    const textColor = "#6b7280";

    const dispatch = createEventDispatcher();

    function render() {
        if (!svg) return;

        const today = d3.timeDay.floor(new Date());
        const start = d3.timeDay.offset(today, -364);

        const days = d3.timeDays(start, d3.timeDay.offset(today, 1));

        const months = d3.timeMonths(
            d3.timeMonth.floor(start),
            d3.timeMonth.ceil(today)
        );

        const dataMap = new Map(
            data.map(d => [d.date, d.value])
        );

        const max = d3.max(data, d => Math.abs(d.value)) || 1;

        const color = d3.scaleDiverging()
            .domain([-max, 0, max])
            .interpolator(d3.interpolateRdYlGn);

        const root = d3.select(svg);
        root.selectAll("*").remove();

        root.append("g")
            .selectAll("rect")
            .data(days)
            .join("rect")
            .attr("width", cellSize)
            .attr("height", cellSize)
            .attr("x", d => d3.timeWeek.count(start, d) * (cellSize + cellGap) + margin.left)
            .attr("y", d => d.getDay() * (cellSize + cellGap) + margin.top)
            .attr("rx", 3)
            .attr("ry", 3)
            .attr("fill", d => {
                const value = dataMap.get(format(d)) ?? 0;
                return value === 0 ? "#e5e7eb" : color(value);
            })
            .on("mouseenter", (event, d) => {
                const date = format(d);
                dispatch("hover", {
                    date,
                    value: dataMap.get(date) ?? 0,
                    x: event.pageX,
                    y: event.pageY
                });
                d3.select(this)
                    .attr("stroke", "var(--gray-700")
                    .attr("stroke-width", 1);
            })
            .on("mousemove", (event) => {
                dispatch("move", {
                    x: event.pageX,
                    y: event.pageY
                });
                d3.select(this).attr("stroke", null);
            })
            .on("mouseleave", () => {
                dispatch("hover", null);
            });

        const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        
        root.append("g")
            .selectAll("text")
            .data(daysOfWeek)
            .join("text")
            .attr("x", margin.left - 25)
            .attr("y", (_, i) => i * (cellSize + cellGap) + margin.top + (cellSize - cellGap) * 0.75)
            .attr("text-achor", "end")
            .attr("font-size", 10)
            .attr("fill", textColor)
            .text(d => d);

        const monthFormat = d3.timeFormat("%b");

        root.append("g")
            .selectAll("text")
            .data(months)
            .join("text")
            .attr("x", d => d3.timeWeek.count(start, d) * (cellSize + cellGap) + margin.left)
            .attr("y", margin.top - 10)
            .attr("text-anchor", "middle")
            .attr("font-size", 10)
            .attr("fill", textColor)
            .text(d => monthFormat(d));

    }

    onMount(render);

    $: render();
</script>

<svg
    bind:this={svg}
    {width}
    {height}
    role="img"
    aria-label="Rolling 365-day calendar heatmap"
/>