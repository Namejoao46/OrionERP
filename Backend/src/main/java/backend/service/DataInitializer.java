package backend.service;

import java.io.IOException; 
import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource; 
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import backend.model.Colaborador;
import backend.repository.ColaboradorRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private ColaboradorRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        
        // --- CONFIGURAÇÃO ADMIN 1 (Leandro) ---
        // Adicionado o (Colaborador) antes do repository para resolver o erro de compilação
        Colaborador admin = (Colaborador) repository.findByLogin("admin");
        
        if (admin == null) {
            admin = new Colaborador();
            admin.setLogin("admin");
            admin.setSenha(passwordEncoder.encode("123"));
        }
        
        admin.setNome("Leandro");
        admin.setSobrenome("Brito");
        admin.setCargo("Administrador");
        admin.setCpf("000.000.000-00");
        admin.setMatricula("ORION-001");
        admin.setDataNascimento(LocalDate.of(2005, 8, 23));
        admin.setTipoColaborador("FULLSTACK");

        try {
            byte[] foto = new ClassPathResource("images/admin1.jpeg").getInputStream().readAllBytes();
            admin.setFoto(foto);
            System.out.println(">>> Sucesso: Foto admin1.jpg carregada.");
        } catch (IOException | IllegalArgumentException e) { 
            System.out.println(">>> Aviso: Erro ao carregar foto admin1.jpeg: " + e.getMessage());
        }
        repository.save(admin);


        // --- CONFIGURAÇÃO ADMIN 2 (João Paulo) ---
        // Adicionado o (Colaborador) aqui também
        Colaborador jp = (Colaborador) repository.findByLogin("admin2");
        
        if (jp == null) {
            jp = new Colaborador();
            jp.setLogin("admin2");
            jp.setSenha(passwordEncoder.encode("456"));
        }

        jp.setNome("João");
        jp.setSobrenome("Paulo");
        jp.setCargo("Administrador");
        jp.setCpf("111.111.111-11"); 
        jp.setMatricula("ORION-002");
        jp.setDataNascimento(LocalDate.of(1995, 5, 20));
        jp.setTipoColaborador("FULLSTACK");

        try {
            byte[] foto = new ClassPathResource("images/admin2.jpg").getInputStream().readAllBytes();
            jp.setFoto(foto);
            System.out.println(">>> Sucesso: Foto admin2.jpg carregada.");
        } catch (IOException | IllegalArgumentException e) { 
            System.out.println(">>> Aviso: Erro ao carregar foto admin2.jpg: " + e.getMessage());
        }
        repository.save(jp);

        System.out.println(">>> Dados iniciais processados com sucesso! <<<");
    }
}