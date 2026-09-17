package br.com.escola;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;

@SpringBootApplication(exclude = { DataSourceAutoConfiguration.class })
public class GestaoEscolarApplication {

    public static void main(String[] args) {
        SpringApplication.run(GestaoEscolarApplication.class, args);
    }
}
