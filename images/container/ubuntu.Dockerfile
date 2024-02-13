ARG BASE_VERSION
FROM local/satysfi-container:ubuntu-${BASE_VERSION}-slim

# install fonts
RUN apt update -y && apt install -y fontconfig && mkdir -p /usr/local/share/fonts/

## install HackGen
ARG HACKGEN_VER=v2.8.0
ARG HACKGEN_FILE=HackGen_NF_${HACKGEN_VER}
RUN curl -sLJO https://github.com/yuru7/HackGen/releases/download/${HACKGEN_VER}/${HACKGEN_FILE}.zip && \
    unzip ${HACKGEN_FILE}.zip && rm ${HACKGEN_FILE}.zip && \
    mv ${HACKGEN_FILE}/* /usr/local/share/fonts/ && rm -rf ${HACKGEN_FILE}

## install Harano Aji
RUN git clone https://github.com/trueroad/HaranoAjiFonts.git && \
    mv ./HaranoAjiFonts/*.otf /usr/local/share/fonts/ && rm -rf ./HaranoAjiFonts

RUN fc-cache -f -v