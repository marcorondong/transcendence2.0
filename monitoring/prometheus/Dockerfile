FROM prom/prometheus:latest

RUN pacman -Syu --noconfirm extra/apache

ENTRYPOINT [ "/entrypoint.sh" ]

CMD [ "/bin/prometheus", \
	"--config.file=/etc/prometheus/prometheus.yml", \
	"--storage.tsdb.path=/prometheus", \
	"--web.config.file=/etc/prometheus/web.yml" ]