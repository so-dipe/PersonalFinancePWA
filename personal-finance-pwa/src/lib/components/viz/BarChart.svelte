<script>
    import { formatAmountShort, formatFinancial } from "$lib/utils";
    import * as d3 from "d3";
    import { createEventDispatcher, onMount } from "svelte";
    import { draw } from "svelte/transition";

    export let data = [];
    export let height = 300;
    export let minWidth = 300;

    let container;
    let width = 0;
    
    const minBarWidth = 40;

    const margin = { top: 5, right: 5, bottom: 30, left: 5 };

    const dispatch = createEventDispatcher();

    let svg;

    $: if (data && width && svg) {
        const numBars = data.length;
        const calculatedWidth = numBars * minBarWidth;
        const actualWidth = Math.max(calculatedWidth, width, minWidth);
        render(data, actualWidth, height);
    }

    function renderEmptyState(innerWidth, innerHeight, g) {
        g.append("rect")
            .attr("width", innerWidth)
            .attr("height", innerHeight)
            .attr("rx", 12)
            .attr("fill", "var(--surface-2");

        g.append("text")
            .attr("x", innerWidth / 2)
            .attr("y", innerHeight / 2)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("fill", "var(--gray-500)")
            .attr("font-size", 16)
            .text("No data to display")
    }

    function wrap(text, width) {
        text.each(function () {
            const textEl = d3.select(this);
            const words = textEl.text().split(/\s+/).reverse();

            let word;
            let line = [];
            let lineNumber = 0;

            const lineHeight = 1.1;
            const y = textEl.attr("y");
            const dy = parseFloat(textEl.attr("dy") || 0);

            let tspan = textEl.text(null)
                .append("tspan")
                .attr("x", 0)
                .attr("y", y)
                .attr("dy", dy + "em");

            while (word = words.pop()) {
                line.push(word);
                
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();

                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = textEl.append("tspan")
                        .attr("x", 0)
                        .attr("y", y)
                        .attr("dy", ++lineNumber * lineHeight + dy + "em")
                        .text(word);
                }
            }
        });
    }

    function render(data, width, height) {
        if (!width || !svg) return;

        d3.select(svg).selectAll("*").remove();

        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const root = d3.select(svg)
            .attr("width", width)
            .attr("height", height);

        const g = root.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        if (!data || data.length === 0) {
            renderEmptyState(innerWidth, innerHeight, g);
            return;
        }

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
            .attr("fill", d => d.color ?? "var(--green-900")
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
                    .attr("fill", d => d.color ?? "var(--green-900")
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
        const xAxis = g.append("g")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(d3.axisBottom(x));

        xAxis.selectAll("text")
            .attr("dy", "0.7em")
            .call(wrap, x.bandwidth());

    }

    onMount(() => {
        const ro = new ResizeObserver(([entry]) => {
            const newWidth = entry.contentRect.width;
            if (newWidth !== width) {
                width = newWidth;
            }
        });
        ro.observe(container);

        return () => ro.disconnect();
    })
</script>

<div class="chart-container" bind:this={container}>
    <svg bind:this={svg}></svg>
</div>
