<script>
    import * as d3 from "d3";
    import { createEventDispatcher, onMount } from "svelte";

    export let data = [];
    export let end = new Date();

    let svg;
    let width = 800;
    let height = 130;

    const cellSize = 12;
    const cellGap = 2;
    const margin = { top: 20, right: 0, bottom: 5, left: 40 };

    const ONE_YEAR_DAYS = 364;

    const format = d3.timeFormat("%Y-%m-%d");

    const textColor = "#6b7280";

    const dispatch = createEventDispatcher();

    function render() {
        if (!svg) return;

        const startDay = d3.timeDay.floor(start);
        const endDay = d3.timeDay.floor(resolvedEnd);

        const days = d3.timeDays(startDay, d3.timeDay.offset(endDay, 1));

        const months = d3.timeMonths(
            d3.timeMonth.floor(startDay),
            d3.timeMonth.ceil(endDay)
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
            .on("mouseenter", function (event, d) {
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
            })
            .on("mouseleave", function () {
                dispatch("hover", null);
                d3.select(this).attr("stroke", null);
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
            .attr("x", d => d3.timeWeek.count(start, d) * (cellSize + cellGap) + margin.left + 8)
            .attr("y", margin.top - 10)
            .attr("text-anchor", "middle")
            .attr("font-size", 10)
            .attr("fill", textColor)
            .text(d => monthFormat(d));

    }

    onMount(render);

    $: resolvedEnd = end
        ? d3.timeDay.floor(end)
        : d3.timeDay.floor(new Date());

    $: start = d3.timeDay.offset(resolvedEnd, -ONE_YEAR_DAYS);

    $: if (svg && data && start && resolvedEnd) {
        render();
    };
</script>

<svg
    bind:this={svg}
    {width}
    {height}
    role="img"
    aria-label="Rolling 365-day calendar heatmap"
/>