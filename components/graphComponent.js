import React, { Component } from 'react'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const colorScale = {
    WASM_EXPORT: {
        fill: '#1892C7',
        font: '#FFFFFF'
    },
    WASM_IMPORT: {

        fill: '#FF6939',
        font: '#FFFFFF'
    },
    WASM_INTERNAL: {
        fill: '#000000',
        font: '#FFFFFF'
    },
    WASM_WORKER: {
        fill: '#1892C7',
        font: '#FFFFFF'
    },
    JS: {
        fill: '#cccccc',
        font: '#000000'
    },
}

const grayScale = {
    WASM_EXPORT: {
        fill: '#000000',
        font: '#FFFFFF'
    },
    WASM_IMPORT: {
        fill: '#969696',
        font: '#FFFFFF'
    },
    WASM_INTERNAL: {
        fill: '#cccccc',
        font: '#000000'
    },
    WASM_WORKER: {
        fill: '#000000',
        font: '#FFFFFF'
    },
    JS: {
        fill: '#636363',
        font: '#FFFFFF'
    },
}

export default class GraphComponent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            graphOptions: {
                combineWorkersAndWindow: true,
                tooLarge: false,
                useGrayscale: false,

            },

        };

        this.graphRef = React.createRef();
        this.handleCheckboxChange = this.handleCheckboxChange.bind(this)
        this.svgPanZoom = null;
    }

    handleCheckboxChange() {
        const isChecked = this.state.graphOptions.useGrayscale;

        const newGraphOptions = { ...this.state.graphOptions };
        newGraphOptions.useGrayscale = !isChecked;
        this.setState({ graphOptions: newGraphOptions });

    }

    initGraph() {
        var container = this.graphRef.current;
        let model = new mxGraphModel();

        this.graph = new mxGraph(container, model);
        const graph = this.graph;
        graph.setPanning(false);
        graph.setEnabled(false);
        graph.autoSizeCellsOnAdd = true;


        const colorsToUse = this.state.graphOptions.useGrayscale ? grayScale : colorScale;

        const commonFunctionStyle = () => {
            var style = new Object();
            style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
            style[mxConstants.STYLE_AUTOSIZE] = '1';
            style[mxConstants.STYLE_SPACING] = '20';
            // style[mxConstants.STYLE_SPACING_TOP] = '2';
            // style[mxConstants.STYLE_SPACING_BOTTOM] = '2';
            style[mxConstants.STYLE_MOVABLE] = '1';
            style[mxConstants.STYLE_FONTSIZE] = '28';
            style[mxConstants.STYLE_FONTSTYLE] = mxConstants.FONT_BOLD;
            style[mxConstants.STYLE_FONTFAMILY] = 'Arial';
            return style
        }


        var wasmExportFunctionStyle = commonFunctionStyle();
        wasmExportFunctionStyle[mxConstants.STYLE_FILLCOLOR] = colorsToUse['WASM_EXPORT'].fill;
        wasmExportFunctionStyle[mxConstants.STYLE_STROKECOLOR] = '#FFFFFF';
        wasmExportFunctionStyle[mxConstants.STYLE_FONTCOLOR] = colorsToUse['WASM_EXPORT'].font;
        graph.getStylesheet().putCellStyle('WASM_EXPORT', wasmExportFunctionStyle);

        var wasmImportFunctionStyle = commonFunctionStyle();
        wasmImportFunctionStyle[mxConstants.STYLE_FILLCOLOR] = colorsToUse['WASM_IMPORT'].fill;
        wasmImportFunctionStyle[mxConstants.STYLE_STROKECOLOR] = '#FFFFFF';
        wasmImportFunctionStyle[mxConstants.STYLE_FONTCOLOR] = colorsToUse['WASM_IMPORT'].font;
        graph.getStylesheet().putCellStyle('WASM_IMPORT', wasmImportFunctionStyle);

        var wasmInternalFunctionStyle = commonFunctionStyle();
        wasmInternalFunctionStyle[mxConstants.STYLE_FILLCOLOR] = colorsToUse['WASM_INTERNAL'].fill;
        wasmInternalFunctionStyle[mxConstants.STYLE_STROKECOLOR] = '#FFFFFF';
        wasmInternalFunctionStyle[mxConstants.STYLE_FONTCOLOR] = colorsToUse['WASM_INTERNAL'].font;
        graph.getStylesheet().putCellStyle('WASM_INTERNAL', wasmInternalFunctionStyle);

        var wasmWorkerFunctionStyle = commonFunctionStyle();
        wasmWorkerFunctionStyle[mxConstants.STYLE_FILLCOLOR] = colorsToUse['WASM_WORKER'].fill;
        wasmWorkerFunctionStyle[mxConstants.STYLE_STROKECOLOR] = '#FFFFFF';
        wasmWorkerFunctionStyle[mxConstants.STYLE_FONTCOLOR] = colorsToUse['WASM_WORKER'].font;
        graph.getStylesheet().putCellStyle('WASM_WORKER', wasmWorkerFunctionStyle);

        var jsFunctionStyle = commonFunctionStyle();
        jsFunctionStyle[mxConstants.STYLE_FILLCOLOR] = colorsToUse['JS'].fill;
        jsFunctionStyle[mxConstants.STYLE_STROKECOLOR] = '#FFFFFF';
        jsFunctionStyle[mxConstants.STYLE_FONTCOLOR] = colorsToUse['JS'].font;
        graph.getStylesheet().putCellStyle('JS', jsFunctionStyle);

        return graph;
    }

    drawGraph() {
        var container = this.graphRef.current;

        const { combineWorkersAndWindow } = this.state.graphOptions;
        const { details } = this.props;
        const windowDetails = details.window;
        const workers = details.workers;
        const vertexDimensions = [0, 0, 100, 50]
        if (windowDetails == null) {
            return <span></span>;
        }

        const exportCalls = windowDetails.exportCalls;
        const importCalls = windowDetails.importCalls;


        let graph;
        if (this.graph == null) {
            graph = this.initGraph()
        } else {
            graph = this.graph
            graph.removeCells(graph.getChildCells(graph.getDefaultParent(), true, true))
            graph = null;
            graph = this.initGraph()

        }
        const model = graph.getModel()

        var parent = graph.getDefaultParent();

        var layout = new mxHierarchicalLayout(graph)
        layout.interRankCellSpacing = 100;
        model
            .beginUpdate();
        const allNodesCombined = {};

        const addKeyFunctions = (functionName, parentVertex, leafStyle) => {
            let vertex;
            if (allNodesCombined[functionName] == null) {

                if (vertexDimensions.every(Number.isFinite)) {
                    console.log('[insertVertex] addKeyFunctions', { label: `${functionName}()`, vertexDimensions, leafStyle });
                    vertex = graph.insertVertex(parentVertex, null, `${functionName}()`, ...vertexDimensions, leafStyle);
                    allNodesCombined[functionName] = vertex;
                } else {
                    console.warn('[insertVertex] Skipped (non-finite dimension) in addKeyFunctions', { functionName, vertexDimensions, leafStyle });
                }
            } else {
                vertex = allNodesCombined[functionName];
            }
        }

        const addToGraph = (functionName, edgesForFunction, parentVertex, leafStyle) => {
            let vertex;
            const allNodesSeparate = {};
            const edgeList = edgesForFunction;
            if (combineWorkersAndWindow) {
                if (allNodesCombined[functionName] == null) {
                    if (vertexDimensions.every(Number.isFinite)) {
                        console.log('[insertVertex] addToGraph', { label: `${functionName}()`, vertexDimensions, leafStyle });
                        vertex = graph.insertVertex(parentVertex, null, `${functionName}()`, ...vertexDimensions, leafStyle);
                        allNodesCombined[functionName] = vertex;
                    } else {
                        console.warn('[insertVertex] Skipped (non-finite dimension) in addToGraph', { functionName, vertexDimensions, leafStyle });
                    }
                } else {
                    vertex = allNodesCombined[functionName];
                }
            } else {
                if (allNodesSeparate[functionName] == null) {
                    if (vertexDimensions.every(Number.isFinite)) {
                        console.log('[insertVertex] addToGraph (separate)', { label: `${functionName}()`, vertexDimensions, leafStyle });
                        vertex = graph.insertVertex(parentVertex, null, `${functionName}()`, ...vertexDimensions, leafStyle);
                        allNodesSeparate[functionName] = vertex;
                    } else {
                        console.warn('[insertVertex] Skipped (non-finite dimension) in addToGraph (separate)', { functionName, vertexDimensions, leafStyle });
                    }
                } else {
                    vertex = allNodesSeparate[functionName];
                }
            }



            for (const edges of edgeList) {
                let previousFunction;
                for (let stackFunctionName of edges) {
                    let jsStyle = 'JS';
                    if (stackFunctionName.includes('wasm-function___')) {
                        jsStyle = 'WASM_INTERNAL';
                        stackFunctionName = stackFunctionName.replace('wasm-function___', '');
                    }
                    let currentFunction = combineWorkersAndWindow ? allNodesCombined[stackFunctionName] : allNodesSeparate[stackFunctionName];

                    if (currentFunction == null) {

                        if (vertexDimensions.every(Number.isFinite)) {
                            console.log('[insertVertex] addToGraph (stack)', { label: `${stackFunctionName}()`, vertexDimensions, jsStyle });
                            currentFunction = graph.insertVertex(parentVertex, null, `${stackFunctionName}()`, ...vertexDimensions, jsStyle);
                            if (combineWorkersAndWindow) {
                                allNodesCombined[stackFunctionName] = currentFunction;
                            } else {
                                allNodesSeparate[stackFunctionName] = currentFunction;
                            }
                        } else {
                            console.warn('[insertVertex] Skipped (non-finite dimension) in addToGraph (stack)', { stackFunctionName, vertexDimensions, jsStyle });
                        }
                    }

                    if (previousFunction != null) {
                        const currentEdges = currentFunction.edges;
                        const previousEdges = previousFunction.edges;
                        let alreadyInGraph = false;
                        if (currentEdges != null) {
                            for (const edge of currentEdges) {
                                if (edge.target.value === previousFunction.value) {
                                    // debugger;
                                    alreadyInGraph = true;
                                }
                            }
                        }

                        if (!alreadyInGraph) {
                            console.log('[insertEdge]', { from: currentFunction && currentFunction.value, to: previousFunction && previousFunction.value });
                            graph.insertEdge(parentVertex, null, '', currentFunction, previousFunction);
                        }
                        previousFunction = currentFunction;


                    } else {
                        previousFunction = currentFunction;
                    }

                }
            }
        }

        for (const scopeInstrumentationRecords of [windowDetails, ...workers]) {
            const wasmFileHashes = Object.keys(scopeInstrumentationRecords.WasmFiles);

            for (const wasmFileHash of wasmFileHashes) {
                const wasmRecordedCallDetails = scopeInstrumentationRecords.WasmFiles[wasmFileHash];

                const debugFunctionNames = wasmRecordedCallDetails.functionNameObjects;
                const wasmExportCalls = wasmRecordedCallDetails.exportCalls;
                const wasmImportCalls = wasmRecordedCallDetails.importCalls;
                const exportFuntionNames = Object.keys(wasmExportCalls);
                const importFuntionNames = Object.keys(wasmImportCalls);

                if (combineWorkersAndWindow) {
                    for (const exportFuntionName of exportFuntionNames) {
                        addKeyFunctions(exportFuntionName, parent, 'WASM_EXPORT');
                    }
                }

                //Need to be sliced and formatted
                for (const exportFuntionName of exportFuntionNames) {
                    const edgeList = wasmExportCalls[exportFuntionName];
                    addToGraph(exportFuntionName, edgeList, parent, 'WASM_EXPORT');
                }

                if (combineWorkersAndWindow) {
                    for (const importFuntionName of importFuntionNames) {
                        addKeyFunctions(importFuntionName, parent, 'WASM_IMPORT');
                    }
                }

                for (const importFuntionName of importFuntionNames) {
                    const edgeList = wasmImportCalls[importFuntionName];
                    addToGraph(importFuntionName, edgeList, parent, 'WASM_IMPORT');
                }
            }
        }



        model
            .endUpdate();
        layout.execute(parent)


    }

    componentDidMount() {
        this.drawGraph();
        // Add mouse wheel zoom and drag-to-pan
        const container = this.graphRef.current;
        if (container) {
            // Mouse wheel zoom (less sensitive)
            let wheelDelta = 0;
            const WHEEL_THRESHOLD = 120; // Typical mouse wheel notch
            container.addEventListener('wheel', (e) => {
                if (!this.graph) return;
                e.preventDefault();
                if (e.ctrlKey || e.metaKey) {
                    wheelDelta += e.deltaY;
                    if (Math.abs(wheelDelta) >= WHEEL_THRESHOLD) {
                        if (wheelDelta < 0) {
                            this.graph.zoomIn();
                        } else {
                            this.graph.zoomOut();
                        }
                        wheelDelta = 0;
                    }
                }
            }, { passive: false });

            // Drag-to-pan
            let isPanning = false;
            let lastX = 0, lastY = 0;
            container.addEventListener('mousedown', (e) => {
                if (e.button !== 0) return; // Only left mouse
                isPanning = true;
                lastX = e.clientX;
                lastY = e.clientY;
                container.style.cursor = 'grabbing';
            });
            window.addEventListener('mousemove', (e) => {
                if (!isPanning) return;
                const dx = e.clientX - lastX;
                const dy = e.clientY - lastY;
                lastX = e.clientX;
                lastY = e.clientY;
                if (this.graph && this.graph.view) {
                    this.graph.view.setTranslate(
                        this.graph.view.translate.x + dx,
                        this.graph.view.translate.y + dy
                    );
                }
            });
            window.addEventListener('mouseup', () => {
                if (isPanning) {
                    isPanning = false;
                    container.style.cursor = '';
                }
            });
        }
    }



    // Add pan/zoom controls for mxGraph
    handleZoomIn = () => {
        if (this.graph) this.graph.zoomIn();
    }
    handleZoomOut = () => {
        if (this.graph) this.graph.zoomOut();
    }
    handleZoomActual = () => {
        if (this.graph) this.graph.zoomActual();
    }
    handlePan = (dx, dy) => {
        if (this.graph && this.graph.view) {
            this.graph.view.setTranslate(
                this.graph.view.translate.x + dx,
                this.graph.view.translate.y + dy
            );
        }
    }

    render() {
        const { graphOptions } = this.state;
        const { combineWorkersAndWindow, tooLarge, useGrayscale } = graphOptions;
        const isChecked = useGrayscale === true;

        return (
            <div>
                <div style={{ marginBottom: 10 }}>
                    <span style={{ fontWeight: 'bold' }}>Tip:</span> Use <b>Ctrl/Cmd + Mouse Wheel</b> to zoom, <b>drag</b> to pan.
                </div>
                <h4>JS/Wasm Interaction Graph</h4>
                <Row>
                    <Col sm={3}>
                        <div style={{
                            width: '20px',
                            height: '20px',
                            backgroundColor: colorScale['WASM_EXPORT'].fill,
                            display: 'inline-block'
                        }}>
                        </div>
                        &nbsp;
                        <span>WebAssembly Export</span>
                    </Col>
                    <Col sm={3}>
                        <div style={{
                            width: '20px',
                            height: '20px',
                            backgroundColor: colorScale['WASM_IMPORT'].fill,
                            display: 'inline-block'
                        }}>
                        </div>
                        &nbsp;
                        <span>WebAssembly Imported JS Function</span>
                    </Col>
                    <Col sm={3}>
                        <div style={{
                            width: '20px',
                            height: '20px',
                            backgroundColor: colorScale.WASM_INTERNAL.fill,
                            display: 'inline-block'
                        }}>
                        </div>
                        &nbsp;
                        <span>WebAssembly Internal Function</span>
                    </Col>
                    <Col sm={3}>
                        <div style={{
                            width: '20px',
                            height: '20px',
                            backgroundColor: colorScale.JS.fill,
                            display: 'inline-block'
                        }}>
                        </div>
                        &nbsp;
                        <span>JavaScript Function</span>
                    </Col>
                </Row>
                <Row style={{
                    position: 'absolute',
                    left: '0',
                    margin: '0',
                    padding: '0',
                    width: '99vw'
                }}>
                    <Col>

                        <div id="graph" ref={this.graphRef}
                            style={{
                                width: '100%',
                                overflow: 'hidden',
                                border: '1px solid #ececec',
                                borderRadius: '5px',
                            }}></div>
                    </Col>
                </Row>
            </div>
        )
    }
}

