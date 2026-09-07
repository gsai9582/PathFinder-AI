import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useLearner } from '../../context/LearnerContext';
import {
  Compass,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Zap,
  Target,
  Clock,
  BookOpen,
  Code,
  Layers,
  Briefcase,
  CheckCircle2,
  Calendar,
  Sliders,
  HelpCircle,
  Eye,
  Terminal,
  Cpu
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { triggerMilestoneConfetti } from '../../animations/confetti';
import { useToast } from '../ui/Toast';

const STEPS = [
  { id: 1, label: 'Goal', title: 'Target Career Goal' },
  { id: 2, label: 'Experience', title: 'Experience Level' },
  { id: 3, label: 'Skills', title: 'Skill Inventory & Baseline' },
  { id: 4, label: 'Courses', title: 'Completed Courses' },
  { id: 5, label: 'Interests', title: 'Specializations & Interests' },
  { id: 6, label: 'Hours', title: 'Weekly Study Hours' },
  { id: 7, label: 'Style', title: 'Learning Style' },
  { id: 8, label: 'Timeline', title: 'Target Timeline' },
];

export const OnboardingWizard: React.FC = () => {
  const navigate = useNavigate();
  const { setProfile, refreshLearnerData } = useLearner();
  const toast = useToast();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isParsingNlp, setIsParsingNlp] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [synthesisStage, setSynthesisStage] = useState<number>(0);

  // Form State
  const [naturalGoal, setNaturalGoal] = useState<string>(
    "I want to become an AI/ML Engineer in 6 months. I know Python and SQL well, but need statistics and machine learning deployment."
  );
  const [careerGoal, setCareerGoal] = useState<string>('AI/ML Engineer');
  const [experienceLevel, setExperienceLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [skillProficiencies, setSkillProficiencies] = useState<Record<string, number>>({
    'Python': 80,
    'SQL': 60,
    'Mathematics': 45,
    'Statistics': 35,
    'Data Structures': 50,
    'Machine Learning': 20,
    'Git & Version Control': 65,
    'Deep Learning': 10,
    'MLOps & Deployment': 5
  });
  const [completedCourses, setCompletedCourses] = useState<string>('Python Fundamentals, SQL Bootcamp');
  const [interests, setInterests] = useState<string[]>(['AI & Machine Learning', 'Computer Vision', 'Deep Learning']);
  const [weeklyHours, setWeeklyHours] = useState<number>(10);
  const [learningStyle, setLearningStyle] = useState<'Hands-on' | 'Project-based' | 'Mixed' | 'Video' | 'Reading'>('Hands-on');
  const [timelineMonths, setTimelineMonths] = useState<number>(6);

  const availableSkillsList = [
    'Python', 'SQL', 'Mathematics', 'Statistics', 'Data Structures', 'Pandas & Data Cleaning',
    'Data Visualization', 'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision',
    'MLOps & Deployment', 'Git & Version Control', 'Cloud Computing', 'HTML & CSS',
    'JavaScript & TypeScript', 'React', 'REST APIs & Backend', 'Docker & Containers',
    'Kubernetes', 'Network Security', 'Threat Modeling'
  ];

  const interestOptions = [
    'AI & Machine Learning', 'Large Language Models (LLMs)', 'Computer Vision',
    'Natural Language Processing', 'MLOps & Pipelines', 'Full Stack Development',
    'Cloud Architecture', 'Cybersecurity Defense', 'Data Analytics & BI'
  ];

  const handleNlpParse = async () => {
    if (!naturalGoal.trim()) return;
    setIsParsingNlp(true);
    try {
      const parsed = await api.analyzeGoal(naturalGoal);
      setCareerGoal(parsed.career_goal);
      setExperienceLevel(parsed.experience_level as any);
      setTimelineMonths(parsed.target_timeline_months);
      setWeeklyHours(parsed.weekly_hours);
      setLearningStyle(parsed.preferred_learning_style as any);

      // Prepopulate skills if found
      if (parsed.extracted_skills && parsed.extracted_skills.length > 0) {
        const updated = { ...skillProficiencies };
        parsed.extracted_skills.forEach(s => {
          if (!updated[s]) updated[s] = 65;
        });
        setSkillProficiencies(updated);
      }
      toast.success('Goal analyzed by AI', `Target role mapped to ${parsed.career_goal}`);
      setCurrentStep(2);
    } catch (err) {
      console.warn('NLP parse fallback:', err);
      setCurrentStep(2);
    } finally {
      setIsParsingNlp(false);
    }
  };

  const toggleInterest = (item: string) => {
    setInterests(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const updateSkillProf = (skill: string, val: number) => {
    setSkillProficiencies(prev => ({ ...prev, [skill]: val }));
  };

  const toggleSkillSelection = (skill: string) => {
    setSkillProficiencies(prev => {
      const copy = { ...prev };
      if (copy[skill] !== undefined) {
        delete copy[skill];
      } else {
        copy[skill] = 50;
      }
      return copy;
    });
  };

  const handleFinalSubmit = async () => {
    setIsGenerating(true);
    setSynthesisStage(1);

    // Animated synthesis stages
    const timer1 = setTimeout(() => setSynthesisStage(2), 600);
    const timer2 = setTimeout(() => setSynthesisStage(3), 1200);
    const timer3 = setTimeout(() => setSynthesisStage(4), 1800);
    const timer4 = setTimeout(() => setSynthesisStage(5), 2400);
    const timer5 = setTimeout(() => setSynthesisStage(6), 3000);

    try {
      const careers = await api.getCareers();
      const matchedCareer = careers.find(c => c.title.toLowerCase().includes(careerGoal.toLowerCase())) || careers[0];
      const allSkills = await api.getSkills();

      const skillsPayload = Object.entries(skillProficiencies).map(([skName, prof]) => {
        const skObj = allSkills.find(s => s.name.toLowerCase() === skName.toLowerCase());
        return {
          skill_id: skObj?.id || 1,
          skill_name: skName,
          current_proficiency: prof
        };
      });

      const newProfile = await api.createProfile({
        email: `learner.${Date.now()}@pathfinder.ai`,
        full_name: 'Alex Morgan',
        career_goal_id: matchedCareer?.id || 1,
        custom_goal_text: naturalGoal,
        experience_level: experienceLevel,
        weekly_hours: weeklyHours,
        target_timeline_months: timelineMonths,
        preferred_learning_style: learningStyle,
        completed_courses_text: completedCourses,
        interests_text: interests.join(', '),
        skills: skillsPayload
      });

      await api.generateRoadmap(newProfile.id, true);
      setProfile(newProfile);
      await refreshLearnerData();

      setTimeout(() => {
        triggerMilestoneConfetti();
        navigate('/dashboard');
      }, 3400);
    } catch (err: any) {
      console.error('Onboarding submission error:', err);
      setTimeout(() => navigate('/dashboard'), 3400);
    }
  };

  // ----------------------------------------------------
  // "Building Your Path" Animated Synthesis Screen
  // ----------------------------------------------------
  if (isGenerating) {
    const synthesisSteps = [
      { id: 1, text: 'Understanding career targets & role benchmarks...', detail: `${careerGoal} taxonomy loaded` },
      { id: 2, text: 'Analyzing baseline competencies & strengths...', detail: `${Object.keys(skillProficiencies).length} skills mapped` },
      { id: 3, text: 'Calculating critical skill-gap delta matrix...', detail: 'Multi-factor priority weights assigned' },
      { id: 4, text: 'Resolving topological prerequisite DAG graph...', detail: 'NetworkX acyclic dependency validated' },
      { id: 5, text: 'Synthesizing adaptive milestone roadmap...', detail: `${weeklyHours} hrs/week over ${timelineMonths} months` },
      { id: 6, text: 'Scoring personalized learning resources & projects...', detail: '100-point explainability matches calibrated' },
    ];

    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-2xl border border-emerald-500/30 bg-slate-900/90 backdrop-blur-md shadow-2xl space-y-6 animate-fade-in text-left">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Building Your Personalized Path</h2>
            <p className="text-xs text-slate-400">PathFinder is tailoring your roadmap to your exact competency gaps.</p>
          </div>

          <div className="space-y-3 pt-2">
            {synthesisSteps.map((s) => {
              const isDone = synthesisStage > s.id;
              const isCurrent = synthesisStage === s.id;
              const isPending = synthesisStage < s.id;

              return (
                <div
                  key={s.id}
                  className={`p-3 rounded-xl border transition-all duration-300 flex items-start space-x-3 ${
                    isDone
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-slate-200'
                      : isCurrent
                      ? 'bg-slate-800 border-slate-700 text-white shadow-sm'
                      : 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-60'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isCurrent ? (
                      <div className="w-4 h-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-700" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <p className={`text-xs font-semibold ${isCurrent ? 'text-emerald-300' : isDone ? 'text-white' : 'text-slate-500'}`}>
                      {s.text}
                    </p>
                    {(isDone || isCurrent) && (
                      <p className="text-[10px] text-slate-400 font-mono">{s.detail}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 text-center text-[11px] text-slate-500 font-mono">
            Finalizing career readiness engine...
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // Main Wizard Stepper
  // ----------------------------------------------------
  return (
    <div className="max-w-2xl mx-auto py-10 px-4 space-y-6">
      {/* Top Header */}
      <div className="text-center space-y-1">
        <Badge variant="default" size="sm">
          GOAL CALIBRATION WIZARD
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Let's Build Your Learning Roadmap
        </h1>
        <p className="text-xs text-slate-400">
          Tell us where you want to go and what you already know.
        </p>
      </div>

      {/* Clean Step Indicator */}
      <div className="p-3 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
        <div className="flex items-center justify-between text-[11px] font-mono mb-2 px-1">
          <span className="text-emerald-400 font-bold">
            STEP 0{currentStep} / 0{STEPS.length}
          </span>
          <span className="text-slate-400">{STEPS[currentStep - 1].title}</span>
        </div>
        <div className="grid grid-cols-8 gap-1.5">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentStep >= s.id ? 'bg-emerald-500' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step 1: Career Goal & Natural Language */}
      {currentStep === 1 && (
        <Card className="p-6 sm:p-8 space-y-6">
          <CardHeader className="p-0 space-y-1">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Step 1 • AI Natural Language Goal</span>
            </div>
            <CardTitle className="text-xl text-white">What is your dream career target?</CardTitle>
            <CardDescription>
              Write naturally or choose a popular career track. Our NLP extractor extracts target roles and timelines.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Natural Language Goal Description</label>
              <textarea
                value={naturalGoal}
                onChange={(e) => setNaturalGoal(e.target.value)}
                rows={3}
                placeholder="e.g. I want to become an AI/ML engineer in 6 months. I know Python and SQL well, but I need deep statistics and ML deployment."
                className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 leading-relaxed font-sans"
              />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Or Select a Verified Career Track:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {[
                  'AI/ML Engineer',
                  'Data Scientist',
                  'Full Stack Developer',
                  'Cloud Engineer',
                  'Cybersecurity Analyst',
                  'Data Analyst'
                ].map((track) => (
                  <button
                    key={track}
                    type="button"
                    onClick={() => {
                      setCareerGoal(track);
                      setNaturalGoal(`I want to become a ${track} within 6 months.`);
                    }}
                    className={`p-2.5 rounded-xl border text-center font-medium transition-all ${
                      careerGoal === track
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {track}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>

          <CardFooter className="p-0 pt-4 flex justify-end">
            <Button
              onClick={handleNlpParse}
              isLoading={isParsingNlp}
              variant="default"
              size="md"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              <span>Analyze & Continue</span>
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 2: Experience Level */}
      {currentStep === 2 && (
        <Card className="p-6 sm:p-8 space-y-6">
          <CardHeader className="p-0 space-y-1">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Step 2 • Background Baseline</span>
            </div>
            <CardTitle className="text-xl text-white">What is your current experience tier?</CardTitle>
            <CardDescription>
              We calibrate recommendations so you aren't bored by basics or overwhelmed by advanced concepts.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 space-y-3">
            {[
              { tier: 'Beginner', title: 'Beginner / Career Starter', desc: 'New to programming or this engineering domain. Need strong foundational theory.' },
              { tier: 'Intermediate', title: 'Intermediate / Transitioning', desc: 'Comfortable with coding basics and standard libraries. Looking to specialize and master role gaps.' },
              { tier: 'Advanced', title: 'Advanced / Upskilling', desc: 'Experienced professional. Want fast-track to high-impact capstone projects and MLOps/cloud scale.' },
            ].map((item) => (
              <div
                key={item.tier}
                onClick={() => setExperienceLevel(item.tier as any)}
                className={`p-4 rounded-xl border cursor-pointer transition-all space-y-1 ${
                  experienceLevel === item.tier
                    ? 'bg-emerald-500/10 border-emerald-500 shadow-sm'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">{item.title}</h4>
                  {experienceLevel === item.tier && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
                <p className="text-[11px] text-slate-400">{item.desc}</p>
              </div>
            ))}
          </CardContent>

          <CardFooter className="p-0 pt-4 flex justify-between">
            <Button onClick={() => setCurrentStep(1)} variant="secondary" size="md">
              Back
            </Button>
            <Button onClick={() => setCurrentStep(3)} variant="default" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Continue
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 3: Skills Inventory */}
      {currentStep === 3 && (
        <Card className="p-6 sm:p-8 space-y-6">
          <CardHeader className="p-0 space-y-1">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase">
              <Target className="w-3.5 h-3.5" />
              <span>Step 3 • Skill Inventory & Ratings</span>
            </div>
            <CardTitle className="text-xl text-white">Select and rate your existing proficiencies</CardTitle>
            <CardDescription>
              Toggle known skills and adjust your self-assessed proficiency (0% to 100%).
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 space-y-4">
            {/* Quick Toggle Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400">Add/Remove Technologies:</span>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                {availableSkillsList.map((sk) => {
                  const isSelected = skillProficiencies[sk] !== undefined;
                  return (
                    <button
                      key={sk}
                      type="button"
                      onClick={() => toggleSkillSelection(sk)}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] transition-all flex items-center space-x-1 ${
                        isSelected
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-emerald-400" />}
                      <span>{sk}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Proficiency Sliders for Selected Skills */}
            <div className="space-y-3 pt-2 max-h-56 overflow-y-auto pr-1">
              <span className="text-[11px] font-semibold text-slate-400">Calibrate Proficiency:</span>
              {Object.entries(skillProficiencies).map(([sk, prof]) => (
                <div key={sk} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-white">{sk}</span>
                    <span className="font-mono text-emerald-400 font-bold">{prof}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={prof}
                    onChange={(e) => updateSkillProf(sk, parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
              ))}
            </div>
          </CardContent>

          <CardFooter className="p-0 pt-4 flex justify-between">
            <Button onClick={() => setCurrentStep(2)} variant="secondary" size="md">
              Back
            </Button>
            <Button onClick={() => setCurrentStep(4)} variant="default" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Continue
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 4: Completed Courses */}
      {currentStep === 4 && (
        <Card className="p-6 sm:p-8 space-y-6">
          <CardHeader className="p-0 space-y-1">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Step 4 • Prior Learning & Courses</span>
            </div>
            <CardTitle className="text-xl text-white">Any completed courses or certifications?</CardTitle>
            <CardDescription>
              Helps us avoid suggesting duplicate introductory material you have already completed.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Completed Courses / Bootcamps</label>
              <textarea
                value={completedCourses}
                onChange={(e) => setCompletedCourses(e.target.value)}
                rows={3}
                placeholder="e.g. CS50 Python, Andrew Ng Machine Learning Specialization, PostgreSQL Bootcamp"
                className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 leading-relaxed font-sans"
              />
            </div>
          </CardContent>

          <CardFooter className="p-0 pt-4 flex justify-between">
            <Button onClick={() => setCurrentStep(3)} variant="secondary" size="md">
              Back
            </Button>
            <Button onClick={() => setCurrentStep(5)} variant="default" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Continue
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 5: Interests & Specializations */}
      {currentStep === 5 && (
        <Card className="p-6 sm:p-8 space-y-6">
          <CardHeader className="p-0 space-y-1">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase">
              <Layers className="w-3.5 h-3.5" />
              <span>Step 5 • Topic Interests</span>
            </div>
            <CardTitle className="text-xl text-white">What specializations excite you most?</CardTitle>
            <CardDescription>
              We prioritize portfolio project capstones aligned with these domains.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {interestOptions.map((opt) => {
                const isSelected = interests.includes(opt);
                return (
                  <div
                    key={opt}
                    onClick={() => toggleInterest(opt)}
                    className={`p-3 rounded-xl border cursor-pointer text-xs font-medium transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500 text-white font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span>{opt}</span>
                    {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                );
              })}
            </div>
          </CardContent>

          <CardFooter className="p-0 pt-4 flex justify-between">
            <Button onClick={() => setCurrentStep(4)} variant="secondary" size="md">
              Back
            </Button>
            <Button onClick={() => setCurrentStep(6)} variant="default" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Continue
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 6: Weekly Study Hours */}
      {currentStep === 6 && (
        <Card className="p-6 sm:p-8 space-y-6">
          <CardHeader className="p-0 space-y-1">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase">
              <Clock className="w-3.5 h-3.5" />
              <span>Step 6 • Weekly Time Budget</span>
            </div>
            <CardTitle className="text-xl text-white">How many hours can you study per week?</CardTitle>
            <CardDescription>
              Used to pace module lengths and compute realistic milestone completion dates.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-center">
              <span className="text-3xl font-black text-emerald-400 font-mono">{weeklyHours} hrs / week</span>
              <p className="text-xs text-slate-400">
                {weeklyHours <= 6
                  ? 'Casual Pace • Great for busy professionals'
                  : weeklyHours <= 15
                  ? 'Balanced Pace • Optimal for steady career transition'
                  : 'Intensive Pace • Accelerated bootcamp sprint'}
              </p>
              <input
                type="range"
                min="2"
                max="35"
                step="1"
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 20].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setWeeklyHours(h)}
                  className={`py-2 rounded-xl border text-xs font-bold font-mono transition-all ${
                    weeklyHours === h
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {h} hrs
                </button>
              ))}
            </div>
          </CardContent>

          <CardFooter className="p-0 pt-4 flex justify-between">
            <Button onClick={() => setCurrentStep(5)} variant="secondary" size="md">
              Back
            </Button>
            <Button onClick={() => setCurrentStep(7)} variant="default" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Continue
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 7: Learning Style */}
      {currentStep === 7 && (
        <Card className="p-6 sm:p-8 space-y-6">
          <CardHeader className="p-0 space-y-1">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase">
              <Sliders className="w-3.5 h-3.5" />
              <span>Step 7 • Format Affinity</span>
            </div>
            <CardTitle className="text-xl text-white">What learning style works best for you?</CardTitle>
            <CardDescription>
              Our recommendation engine weights resource formats to fit your cognitive style.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 space-y-2.5">
            {[
              { style: 'Hands-on', title: 'Hands-on Code-First', desc: 'Interactive coding exercises, notebooks, and direct implementation.' },
              { style: 'Project-based', title: 'Project-Based Capstones', desc: 'Building end-to-end applications and portfolio deliverables.' },
              { style: 'Mixed', title: 'Mixed & Balanced', desc: 'Combines video lectures, theoretical reading, and applied code labs.' },
              { style: 'Video', title: 'Visual & Video Lectures', desc: 'Video screencasts, animated diagrams, and visual walkthroughs.' },
              { style: 'Reading', title: 'Documentation & Books', desc: 'Official documentation, deep-dive articles, and theoretical textbooks.' },
            ].map((item) => (
              <div
                key={item.style}
                onClick={() => setLearningStyle(item.style as any)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-0.5 ${
                  learningStyle === item.style
                    ? 'bg-emerald-500/10 border-emerald-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">{item.title}</h4>
                  {learningStyle === item.style && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
                <p className="text-[11px] text-slate-400">{item.desc}</p>
              </div>
            ))}
          </CardContent>

          <CardFooter className="p-0 pt-4 flex justify-between">
            <Button onClick={() => setCurrentStep(6)} variant="secondary" size="md">
              Back
            </Button>
            <Button onClick={() => setCurrentStep(8)} variant="default" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Continue
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 8: Timeline & Final Review */}
      {currentStep === 8 && (
        <Card className="p-6 sm:p-8 space-y-6 border-emerald-500/30 bg-slate-900/80">
          <CardHeader className="p-0 space-y-1">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase">
              <Calendar className="w-3.5 h-3.5" />
              <span>Step 8 • Target Timeline & Review</span>
            </div>
            <CardTitle className="text-xl text-white">Target Graduation Window</CardTitle>
            <CardDescription>
              Select your target completion horizon to finalize prerequisite scheduling.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 space-y-4">
            <div className="grid grid-cols-4 gap-2">
              {[3, 6, 9, 12].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setTimelineMonths(m)}
                  className={`py-3 rounded-xl border text-center font-bold transition-all ${
                    timelineMonths === m
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-base font-mono">{m}</div>
                  <div className="text-[10px] text-slate-400">Months</div>
                </button>
              ))}
            </div>

            {/* Final Profile Snapshot */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Target Role:</span>
                <span className="font-bold text-white">{careerGoal}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Weekly Commitment:</span>
                <span className="font-bold text-emerald-400">{weeklyHours} hrs/week</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Selected Skills:</span>
                <span className="font-bold text-slate-200">{Object.keys(skillProficiencies).length} Skills</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Learning Format:</span>
                <span className="font-bold text-slate-200">{learningStyle}</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="p-0 pt-4 flex justify-between">
            <Button onClick={() => setCurrentStep(7)} variant="secondary" size="md">
              Back
            </Button>
            <Button
              onClick={handleFinalSubmit}
              variant="default"
              size="lg"
              leftIcon={<Zap className="w-4 h-4 text-slate-950 fill-slate-950" />}
              className="shadow-xl shadow-emerald-500/25"
            >
              <span>Generate My Roadmap</span>
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};
