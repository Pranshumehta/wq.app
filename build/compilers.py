from wq.core import wq
import click

import os
import subprocess
import random
import json

from .collect import readfiles


@wq.command()
@wq.pass_config
def optimize(config):
    """
    Use r.js to optimize JS and CSS assets
    """
    conf = config.get('optimize', None)
    if not conf:
        click.echo("optimize section not found in %s" % config.filename)
        return
    outdir = conf.get('dir', None)

    bfile = "rjsconf%s" % (random.random() * 10000)
    bjs = open(bfile, 'w')
    json.dump(conf, bjs)
    bjs.close()

    # Defer to r.js for actual processing
    click.echo('#' * 20)
    click.echo("Optimizing with r.js")
    rjs = os.path.dirname(__file__) + "/r.js"
    subprocess.call(["node", rjs, "-o", bfile])
    os.remove(bfile)
    if outdir:
        os.remove(outdir + '/' + bfile)
    click.echo("Optimization complete")
    click.echo('#' * 20)


@wq.command()
@click.option(
    '--indir', type=click.Path(exists=True), default="scss",
    help="Path to SCSS/SASS files"
)
@click.option(
    '--outdir', type=click.Path(exists=True), default="css",
    help="Path to CSS files"
)
def scss(**conf):
    """
    Render all SCSS/SASS files into CSS
    """
    import scss
    import logging
    compiler = scss.Scss(scss_opts={'compress': 0})
    logging.getLogger("scss").addHandler(logging.StreamHandler())

    def compile(path, source):
        css = compiler.compile(source)
        outfile = open(path, 'w')
        outfile.write(css)
        outfile.close()

    files = readfiles(conf['indir'], "scss")
    scss.config.LOAD_PATHS = [
        conf['indir'],
        os.path.join(conf['indir'], 'lib'),
    ]
    for name, source in files.items():
        if isinstance(source, dict):
            continue
        path = "%s/%s.css" % (conf['outdir'], name)
        compile(path, source)
        click.echo("%s compiled from %s/%s.scss" % (path, conf['indir'], name))


@wq.command()
@click.option('--template', help="Path to template")
@click.option('--partials', help="Path to partials")
@click.option('--context', help="Path to context (JSON or YAML)")
@click.option(
    '--output', type=click.Path(), default="output.html",
    help="Output filename"
)
def mustache(**conf):
    """
    Render a mustache template into static HTML
    """
    import pystache
    template = conf['template']
    if template is None:
        return
    if os.sep in template or template.endswith(".html"):
        template = open(template).read()

    context = conf["context"] or {}
    if not isinstance(context, dict):
        path = context
        context = readfiles(path, "yaml", "yml")
        context.update(**readfiles(path, "json"))

    partials = conf['partials'] or {}
    if not isinstance(partials, dict):
        partials = readfiles(partials, "html")

    click.echo("Generating %s from %s" % (conf['output'], conf['template']))
    renderer = pystache.Renderer(partials=partials)
    html = renderer.render(template, context)
    f = open(conf['output'], 'w')
    f.write(html)
    f.close()
