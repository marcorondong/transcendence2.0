## Setting up
1. cd into `cli-client` folder
2. create virtual env `virtualenv venv`
3. Activate virtual env => `source venv/bin/activate`
4. Optional: check if virtual env is activated by running `which python3`. It should give output something like `<workspaceFolder>/cli-client/venv/bin/python3`. if it is like `/usr/bin/ptyhon3` it is NOT activated
5. run `pip install -r  requirements.txt` for installing dependecies

## App
0. RUN pong-api server
1. run CLI client with `python3 main.py`
2. Use `w` to go up `s` to go down and watch in browser movements until i implement something better
