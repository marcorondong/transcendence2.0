import logging

logging.basicConfig(
	filename="cli-client.log",
	level=logging.DEBUG,
	format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

myLogger = logging.getLogger("cliClient") #use myLogger.debug("Hello word") to print in file called cli-client.log
