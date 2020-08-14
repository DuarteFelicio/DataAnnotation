import React, { Component } from 'react'
import { Accordion, Card, Button } from 'react-bootstrap'
import { PieChart, Pie, Sector } from 'recharts';

export default class AccordionComp extends Component {

    renderActiveShape (props)  {
        const RADIAN = Math.PI / 180;
        const {
            cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
            fill, payload, percent, value,
        } = props;
        const sin = Math.sin(-RADIAN * midAngle);
        const cos = Math.cos(-RADIAN * midAngle);
        const sx = cx + (outerRadius + 10) * cos;
        const sy = cy + (outerRadius + 10) * sin;
        const mx = cx + (outerRadius + 30) * cos;
        const my = cy + (outerRadius + 30) * sin;
        const ex = mx + (cos >= 0 ? 1 : -1) * 22;
        const ey = my;
        const textAnchor = cos >= 0 ? 'start' : 'end';

        return (
            <g>
                <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#45A8DD" style={{ fontWeight:'bold' }}>{payload.name}</text>
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill="#45A8DD"
                />
                <Sector
                    cx={cx}
                    cy={cy}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    innerRadius={outerRadius + 6}
                    outerRadius={outerRadius + 10}
                    fill="#45A8DD"
                />
                <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke="#45A8DD" fill="none" />
                <circle cx={ex} cy={ey} r={2} fill="#45A8DD" stroke="none" />
                <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`${value} Files`}</text>
                <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
                    {`(Rate ${(percent * 100).toFixed(2)}%)`}
                </text>
            </g>
        );
    };


    render() {
        let width = this.props.width
        let height = this.props.height
        let activeIndex = this.props.activeIndex
        let data = this.props.data
        let cx = this.props.cx
        let cy = this.props.cy
        let innerRadius = this.props.innerRadius
        let outerRadius = this.props.outerRadius
        let fill = this.props.fill
        let dataKey = this.props.dataKey
        let onMouseEnter = this.props.onMouseEnter

        return (
            <PieChart width={width} height={height}>
                <Pie
                    activeIndex={activeIndex}
                    activeShape={this.renderActiveShape}
                    data={data}
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius}
                    fill={fill}
                    dataKey={dataKey}
                    onMouseEnter={onMouseEnter}
                />
            </PieChart>
        )
    }
}