package backend.service;

import java.io.IOException; 
import java.time.LocalDate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.lang.NonNull;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import backend.model.Colaborador;
import backend.model.UserRole;
import backend.repository.ColaboradorRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private ColaboradorRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        
        // --- ADMIN 1 ---
        Colaborador admin = (Colaborador) repository.findByLogin("admin");
        if (admin == null) {
            admin = new Colaborador();
            preencherDadosBase(admin, "admin", "123", "Leandro", "ORION-001");
            carregarFoto(admin, "images/admin1.jpeg");
            repository.save(admin);
        }

        // --- ADMIN 2 ---
        Colaborador jp = (Colaborador) repository.findByLogin("admin2");
        if (jp == null) {
            jp = new Colaborador();
            preencherDadosBase(jp, "admin2", "456", "João Paulo", "ORION-002");
            carregarFoto(jp, "images/admin2.jpg");
            repository.save(jp);
        }
    }

    private void preencherDadosBase(Colaborador c, String login, String senha, String nome, String mat) {
        c.setLogin(login);
        c.setSenha(passwordEncoder.encode(senha));
        c.setRole(UserRole.ADMIN_DEV);
        c.setNome(nome);
        c.setMatricula(mat);
        c.setCargo("Administrador");
        c.setTipoColaborador("FULLSTACK");
        c.setDataNascimento(LocalDate.of(2000, 1, 1));
    }

    private void carregarFoto(Colaborador c, @NonNull String path) {
        try {
            byte[] foto = new ClassPathResource(path).getInputStream().readAllBytes();
            c.setFoto(foto);
        } catch (IOException | IllegalArgumentException e) { // Aqui está o MULTICATCH sugerido
            System.out.println(">>> Aviso: Não foi possível carregar a foto " + path);
        }
    }
}