FROM mysql:8.4.8
COPY --chmod=0644 infra/mysql/my.cnf /etc/mysql/conf.d/linkme.cnf
COPY --chmod=0755 infra/mysql/00-users.sh /docker-entrypoint-initdb.d/00-users.sh
