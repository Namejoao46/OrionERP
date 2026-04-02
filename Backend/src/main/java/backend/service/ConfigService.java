package backend.service;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Properties;

import org.springframework.stereotype.Service;

@Service
public class ConfigService {

    private final String CONFIG_FILE = "config-erp.properties";

    public String getDbPath() {
        Properties props = new Properties();
        try (FileInputStream in = new FileInputStream(CONFIG_FILE)) {
            props.load(in);
            return props.getProperty("db.path", "C:/OrionERP/DADOS.FDB");
        } catch (IOException e) {
            return "C:/Users/joaop/Documents/OrionERP/DADOS.FDB";
        }
    }
    public void saveDbPath(String newPath) throws IOException {
        Properties props = new Properties();
        props.setProperty("db.path", newPath);
        
        try (FileOutputStream out = new FileOutputStream(CONFIG_FILE)) {
            props.store(out, "Configuracao de Banco de Dados - OrionERP");
        }
    }
}
