FROM grafana/grafana:11.6.0

USER root

RUN mkdir -p /run/secrets && chown grafana /run/secrets && chmod -R 660 /run/secrets

USER grafana

ENTRYPOINT [ "/etc/grafana/entrypoint.sh" ]