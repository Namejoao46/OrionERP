package backend.config;

import java.util.Properties;

import javax.sql.DataSource;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;

import backend.service.ConfigService;

@Configuration
public class DatabaseConfig {

    @Bean
    @Primary
    public DataSource dataSource(ConfigService configService) {
        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setDriverClassName("org.firebirdsql.jdbc.FBDriver");
        
        String path = configService.getDbPath();
        dataSource.setUrl("jdbc:firebirdsql://localhost:3050/" + path.replace("\\", "/") + "?encoding=UTF8");
        
        dataSource.setUsername("SYSDBA");
        dataSource.setPassword("masterkey");
        
        return dataSource;
    }

    @Bean
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(DataSource dataSource) {
        LocalContainerEntityManagerFactoryBean em = new LocalContainerEntityManagerFactoryBean();
        em.setDataSource(dataSource);
        em.setPackagesToScan("backend.model");

        HibernateJpaVendorAdapter vendorAdapter = new HibernateJpaVendorAdapter();
        em.setJpaVendorAdapter(vendorAdapter);

        Properties properties = new Properties();
        properties.setProperty("hibernate.dialect", "org.hibernate.community.dialect.FirebirdDialect");
        
        properties.setProperty("hibernate.temp.use_jdbc_metadata_defaults", "false");
        
        properties.setProperty("hibernate.hbm2ddl.auto", "update");
        properties.setProperty("hibernate.show_sql", "true");
        
        em.setJpaProperties(properties);
        return em;
    }
}