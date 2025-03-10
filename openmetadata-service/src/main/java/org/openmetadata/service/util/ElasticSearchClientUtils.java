/*
 *  Copyright 2021 Collate
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

package org.openmetadata.service.util;

import java.security.KeyStoreException;
import javax.net.ssl.SSLContext;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.http.HttpHost;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.CredentialsProvider;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.elasticsearch.ElasticsearchException;
import org.elasticsearch.client.RestClient;
import org.elasticsearch.client.RestClientBuilder;
import org.elasticsearch.client.RestHighLevelClient;
import org.openmetadata.schema.service.configuration.elasticsearch.ElasticSearchConfiguration;

@Slf4j
public final class ElasticSearchClientUtils {
  private ElasticSearchClientUtils() {}

  public static RestHighLevelClient createElasticSearchClient(ElasticSearchConfiguration esConfig) {
    try {
      RestClientBuilder restClientBuilder =
          RestClient.builder(new HttpHost(esConfig.getHost(), esConfig.getPort(), esConfig.getScheme()));

      if (StringUtils.isNotEmpty(esConfig.getUsername()) && StringUtils.isNotEmpty(esConfig.getPassword())) {
        CredentialsProvider credentialsProvider = new BasicCredentialsProvider();
        credentialsProvider.setCredentials(
            AuthScope.ANY, new UsernamePasswordCredentials(esConfig.getUsername(), esConfig.getPassword()));
        SSLContext sslContext = createElasticSearchSSLContext(esConfig);
        restClientBuilder.setHttpClientConfigCallback(
            httpAsyncClientBuilder -> {
              httpAsyncClientBuilder.setDefaultCredentialsProvider(credentialsProvider);
              if (sslContext != null) {
                httpAsyncClientBuilder.setSSLContext(sslContext);
              }
              return httpAsyncClientBuilder;
            });
      }
      restClientBuilder.setRequestConfigCallback(
          requestConfigBuilder ->
              requestConfigBuilder
                  .setConnectTimeout(esConfig.getConnectionTimeoutSecs() * 1000)
                  .setSocketTimeout(esConfig.getSocketTimeoutSecs() * 1000));
      return new RestHighLevelClient(restClientBuilder);
    } catch (Exception e) {
      throw new ElasticsearchException("Failed to create elastic search client ", e);
    }
  }

  private static SSLContext createElasticSearchSSLContext(ElasticSearchConfiguration elasticSearchConfiguration)
      throws KeyStoreException {

    if (elasticSearchConfiguration.getScheme().equals("https")) {
      return SSLUtil.createSSLContext(
          elasticSearchConfiguration.getTruststorePath(),
          elasticSearchConfiguration.getTruststorePassword(),
          "ElasticSearch");
    }
    return null;
  }
}
