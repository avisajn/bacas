class CallgraphMiddleware(object):
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        from pycallgraph import PyCallGraph
        from pycallgraph.output import GraphvizOutput
        import time

        graphviz = GraphvizOutput()
        graphviz.output_file = 'callgraph-' + str(time.time()) + '.svg'
        graphviz.output_type = 'svg'

        with PyCallGraph(output=graphviz):
            response = self.get_response(request)
        return response
