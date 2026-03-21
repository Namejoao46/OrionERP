package backend.service;

import backend.model.Colaborador;
import backend.repository.ColaboradorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private ColaboradorRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (repository.count() == 0) {
            Colaborador admin = new Colaborador();
            admin.setLogin("admin");
            
            admin.setSenha(passwordEncoder.encode("123")); 
            
            admin.setNome("Leandro");
            admin.setSobrenome("Brito");
            admin.setCargo("Administrador");
            admin.setCpf("000.000.000-00");
            admin.setMatricula("ORION-001");
            admin.setDataNascimento(LocalDate.of(2000, 1, 1));
            admin.setTipoColaborador("FULLSTACK");

            repository.save(admin);
            System.out.println(">>> Utilizador ADMIN criado com sucesso (Senha: 123) <<<");
        }
    }
}