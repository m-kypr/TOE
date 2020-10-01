import random
from flask import Flask, render_template, url_for
app = Flask(__name__)

colors = [(255, 0, 0), (0, 255, 0),
          (0, 0, 0), (0, 0, 255)]
colors = ['red', 'blue', 'white', 'green', 'yellow']

@app.route('/')
def hello_world():
    color = random.choice(colors)
    html = []
    size = 150
    border = size//100
    for i in range(3):
        for j in range(3):
            html.append(f"""
      <div id={i}{j} style="border: {border}px solid black; width: {size-border*2}px; height: {size-border*2}px; position: absolute; left: {i*size}px; top: {j*size}px"></div>""")
    return render_template('index.html', tictactoe=''.join(html), script=f""" <script type="text/javascript"
         src="{ url_for('static', filename='click.js') }"></script>""", style=f"""<style>div {{font-size: {size}px; 
        text-align: center;
        display: flex;
        flex-direction: column;
        # background-color: {color};
        justify-content: center;}}</style>""")


if __name__ == "__main__":
    app.run(debug=True)
